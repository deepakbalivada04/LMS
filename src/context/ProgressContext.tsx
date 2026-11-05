import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProgress } from '../types/course';
import { projectService } from '../services/projectService';
import { useAuth } from './AuthContext';
import { progressApi } from '../services/progressApi';

interface ProgressContextType {
  progressMap: Record<string, UserProgress>; // keyed by courseId
  markModuleComplete: (courseId: string, moduleId: string) => Promise<UserProgress>;
  isModuleCompleted: (courseId: string, moduleId: string) => boolean;
  getCourseProgress: (courseId: string) => UserProgress;
  resetCourseProgress: (courseId: string) => void;
  isLoading: boolean;
  isSyncingWithAWS: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const LOCAL_STORAGE_PROGRESS_PREFIX = 'robolms_progress_';

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingWithAWS, setIsSyncingWithAWS] = useState<boolean>(false);

  // Initialize progress for courses based on user session
  useEffect(() => {
    if (!user) {
      setProgressMap({});
      setIsLoading(false);
      return;
    }

    const initProgress = async () => {
      setIsLoading(true);
      const storageKey = `${LOCAL_STORAGE_PROGRESS_PREFIX}${user.userId}`;
      const saved = localStorage.getItem(storageKey);

      let currentMap: Record<string, UserProgress> = {};
      if (saved) {
        try {
          currentMap = JSON.parse(saved);
        } catch {
          currentMap = {};
        }
      }

      // Initialize genuine zero progress for all active projects from DB/registry
      const registeredProjects = projectService.getAllProjects();
      for (const proj of registeredProjects) {
        const id = proj.projectId || proj.courseId;
        if (!currentMap[id]) {
          currentMap[id] = {
            userId: user.userId,
            courseId: id,
            completionPercentage: 0,
            completedModules: [],
            examScore: undefined,
            lastUpdated: new Date().toISOString(),
          };
        }
      }

      // Sync with live AWS DynamoDB LMS_Progress if configured
      try {
        for (const proj of registeredProjects.slice(0, 3)) {
          const id = proj.projectId || proj.courseId;
          const remote = await progressApi.fetchProgress(user.userId, id);
          if (remote) {
            currentMap[id] = remote;
          }
        }
      } catch (syncErr) {
        console.warn('[ProgressContext] AWS sync note:', syncErr);
      }

      setProgressMap(currentMap);
      localStorage.setItem(storageKey, JSON.stringify(currentMap));
      setIsLoading(false);
    };

    initProgress();
  }, [user]);

  const saveProgressLocally = (courseId: string, updated: UserProgress) => {
    if (!user) return;
    const storageKey = `${LOCAL_STORAGE_PROGRESS_PREFIX}${user.userId}`;
    const nextMap = { ...progressMap, [courseId]: updated };
    setProgressMap(nextMap);
    localStorage.setItem(storageKey, JSON.stringify(nextMap));
  };

  const getCourseProgress = (courseId: string): UserProgress => {
    if (progressMap[courseId]) return progressMap[courseId];
    return {
      userId: user?.userId || 'guest',
      courseId,
      completionPercentage: 0,
      completedModules: [],
    };
  };

  const isModuleCompleted = (courseId: string, moduleId: string): boolean => {
    const courseProg = progressMap[courseId];
    return courseProg ? courseProg.completedModules.includes(moduleId) : false;
  };

  /**
   * Phase 3: Optimistic local update + AWS Lambda / DynamoDB synchronization
   */
  const markModuleComplete = async (courseId: string, moduleId: string): Promise<UserProgress> => {
    const current = getCourseProgress(courseId);
    const completedSet = new Set(current.completedModules);
    completedSet.add(moduleId);
    const completedModules = Array.from(completedSet);

    // Calculate percentage based on project modules count
    const targetProject = projectService.getProjectById(courseId);
    const totalModules = targetProject && targetProject.modules.length > 0 ? targetProject.modules.length : Math.max(1, completedModules.length);
    const completionPercentage = Math.round((completedModules.length / totalModules) * 100);

    const localRecord: UserProgress = {
      ...current,
      completedModules,
      completionPercentage: Math.min(completionPercentage, 100),
      lastUpdated: new Date().toISOString(),
    };

    // 1. Optimistic update
    saveProgressLocally(courseId, localRecord);

    // 2. Call AWS Lambda via API Gateway (if user is authenticated and endpoint is configured)
    if (user?.userId) {
      setIsSyncingWithAWS(true);
      try {
        const remoteRecord = await progressApi.updateProgress(user.userId, courseId, moduleId);
        if (remoteRecord) {
          saveProgressLocally(courseId, remoteRecord);
          return remoteRecord;
        }
      } catch (err) {
        console.warn('[ProgressContext] AWS sync failed, kept local state:', err);
      } finally {
        setIsSyncingWithAWS(false);
      }
    }

    return localRecord;
  };

  const resetCourseProgress = (courseId: string) => {
    const resetProgress: UserProgress = {
      userId: user?.userId || 'guest',
      courseId,
      completionPercentage: 0,
      completedModules: [],
      examScore: undefined,
      certificateUrl: undefined,
      lastUpdated: new Date().toISOString(),
    };
    saveProgressLocally(courseId, resetProgress);
  };

  return (
    <ProgressContext.Provider
      value={{
        progressMap,
        markModuleComplete,
        isModuleCompleted,
        getCourseProgress,
        resetCourseProgress,
        isLoading,
        isSyncingWithAWS,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

const DEFAULT_FALLBACK_PROGRESS: UserProgress = {
  userId: 'guest',
  courseId: '',
  completionPercentage: 0,
  completedModules: [],
};

const DEFAULT_PROGRESS_CONTEXT: ProgressContextType = {
  progressMap: {},
  markModuleComplete: async () => DEFAULT_FALLBACK_PROGRESS,
  isModuleCompleted: () => false,
  getCourseProgress: (courseId: string) => ({
    userId: 'guest',
    courseId,
    completionPercentage: 0,
    completedModules: [],
  }),
  resetCourseProgress: () => {},
  isLoading: false,
  isSyncingWithAWS: false,
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  return context || DEFAULT_PROGRESS_CONTEXT;
};
