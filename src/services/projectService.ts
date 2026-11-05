import { HardwareProject, ProjectStage } from '../types/course';
import { SAMPLE_PROJECTS } from '../lib/mockData';
import { userService } from './userService';

const PROJECTS_STORAGE_KEY = 'robolms_projects_registry';

export const projectService = {
  getAllProjects(): HardwareProject[] {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      let list: HardwareProject[];
      if (!stored) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
        list = SAMPLE_PROJECTS;
      } else {
        const parsed: HardwareProject[] = JSON.parse(stored);
        list = Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_PROJECTS;
      }

      // Automatically purge any stale static BigBuckBunny mock videos from existing localStorage data
      let updated = false;
      const LIVE_STREAM_URL = 'https://robotics-lms-videos-processed-2026.s3.ap-southeast-2.amazonaws.com/projects/crs-esp32-rover/1793905763827-gemini_generated_video_fac0cdb7/hls/1793905763827-gemini_generated_video_fac0cdb7.m3u8';

      // Merge in any new skills/clusters from canonical definition if not yet present
      for (const sample of SAMPLE_PROJECTS) {
        if (!list.some((p) => p.projectId === sample.projectId)) {
          list.push(sample);
          updated = true;
        }
      }

      const cleanedList = list.map((proj) => ({
        ...proj,
        modules: (proj.modules || []).map((m) => {
          if (m.videoUrl && (m.videoUrl.includes('BigBuckBunny') || m.videoUrl.includes('commondatastorage.googleapis.com'))) {
            updated = true;
            return {
              ...m,
              videoUrl: LIVE_STREAM_URL,
            };
          }
          return m;
        }),
      }));

      if (updated) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(cleanedList));
        return cleanedList;
      }

      return list;
    } catch {
      return SAMPLE_PROJECTS;
    }
  },

  getProjectsByCategory(category: string): HardwareProject[] {
    const all = this.getAllProjects();
    if (!category || category === 'ALL') return all;
    const cleanFilter = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    return all.filter((p) => p.category.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanFilter);
  },

  getProjectsByPathway(pathwayId: string): HardwareProject[] {
    const all = this.getAllProjects();
    if (!pathwayId || pathwayId === 'all') return all;
    return all.filter((p) => p.pathwayId === pathwayId);
  },

  getProjectById(id: string): HardwareProject | undefined {
    const list = this.getAllProjects();
    return list.find((p) => p.projectId === id || p.courseId === id);
  },

  /**
   * Determine whether a student has been granted access to this specific course by the Admin
   */
  isUserEnrolledInProject(
    user: { email?: string; role?: string; enrolledProjectIds?: string[]; enrolledPathways?: string[] } | null,
    projectOrId: HardwareProject | string
  ): boolean {
    if (!user || !user.email) return false;
    
    // Super Admin has master access to all projects
    const cleanEmail = user.email.toLowerCase().trim();
    if (user.role === 'admin' || cleanEmail === 'sannathkoushik@gmail.com') {
      return true;
    }

    const projectId = typeof projectOrId === 'string' ? projectOrId : projectOrId.projectId;
    const project = typeof projectOrId === 'string' ? this.getProjectById(projectId) : projectOrId;

    // Check live persistent user record from registry
    const userRecord = userService.getUserByEmail(cleanEmail);
    const enrolledProjects = userRecord?.enrolledProjectIds || user.enrolledProjectIds || [];
    const enrolledPathways = userRecord?.enrolledPathways || user.enrolledPathways || [];

    // 1. Direct project enrollment match
    if (enrolledProjects.includes(projectId) || (project?.courseId && enrolledProjects.includes(project.courseId))) {
      return true;
    }

    // 2. Full curriculum pathway enrollment
    if (enrolledPathways.includes('all')) {
      return true;
    }

    // 3. Cluster pathway match (e.g. 'robot-kits', 'how-ai-thinks')
    if (project?.pathwayId && enrolledPathways.includes(project.pathwayId)) {
      return true;
    }

    return false;
  },

  /**
   * Standard commercial LMS filter:
   * Returns ONLY the projects/courses that this student is explicitly enrolled in / assigned by the Admin.
   */
  getEnrolledProjectsForUser(
    user: { email?: string; role?: string; enrolledProjectIds?: string[]; enrolledPathways?: string[] } | null
  ): HardwareProject[] {
    const all = this.getAllProjects();
    if (!user || !user.email) return [];

    const cleanEmail = user.email.toLowerCase().trim();
    if (user.role === 'admin' || cleanEmail === 'sannathkoushik@gmail.com') {
      return all;
    }

    return all.filter((p) => this.isUserEnrolledInProject(user, p));
  },

  createProject(project: HardwareProject): HardwareProject {
    const list = this.getAllProjects();
    const existingIndex = list.findIndex((p) => p.projectId === project.projectId);
    if (existingIndex >= 0) {
      throw new Error(`Project with ID "${project.projectId}" already exists.`);
    }

    // Ensure backwards compatibility between courseId and projectId
    const normalized: HardwareProject = {
      ...project,
      courseId: project.projectId,
      modules: project.modules.map((m) => ({
        ...m,
        stageId: m.stageId || m.moduleId,
        moduleId: m.moduleId || m.stageId,
      })),
    };

    list.push(normalized);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return normalized;
  },

  updateProject(id: string, updates: Partial<HardwareProject>): HardwareProject {
    const list = this.getAllProjects();
    const index = list.findIndex((p) => p.projectId === id || p.courseId === id);
    if (index === -1) {
      throw new Error(`Project "${id}" not found.`);
    }

    const updated: HardwareProject = {
      ...list[index],
      ...updates,
      projectId: list[index].projectId,
      courseId: list[index].courseId,
    };

    list[index] = updated;
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return updated;
  },

  deleteProject(id: string): boolean {
    const list = this.getAllProjects();
    const filtered = list.filter((p) => p.projectId !== id && p.courseId !== id);
    if (filtered.length === list.length) {
      return false;
    }
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  addStage(projectId: string, stage: ProjectStage): HardwareProject {
    const list = this.getAllProjects();
    const index = list.findIndex((p) => p.projectId === projectId || p.courseId === projectId);
    if (index === -1) {
      throw new Error(`Project "${projectId}" not found.`);
    }

    const normalizedStage: ProjectStage = {
      ...stage,
      stageId: stage.stageId || `mod-${Date.now()}`,
      moduleId: stage.moduleId || stage.stageId || `mod-${Date.now()}`,
      hardwareChecklist: stage.hardwareChecklist || [],
      wiringDiagrams: stage.wiringDiagrams || [],
      codeSnippets: stage.codeSnippets || [],
    };

    list[index].modules.push(normalizedStage);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return list[index];
  },

  updateStageVideo(projectId: string, stageId: string, videoUrl: string): HardwareProject {
    const list = this.getAllProjects();
    const projectIndex = list.findIndex((p) => p.projectId === projectId || p.courseId === projectId);
    if (projectIndex === -1) throw new Error('Project not found');

    const stageIndex = list[projectIndex].modules.findIndex(
      (m) => m.stageId === stageId || m.moduleId === stageId
    );
    if (stageIndex === -1) throw new Error('Stage not found');

    list[projectIndex].modules[stageIndex].videoUrl = videoUrl;
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return list[projectIndex];
  },

  updateStage(projectId: string, stageId: string, updates: Partial<ProjectStage>): HardwareProject {
    const list = this.getAllProjects();
    const projectIndex = list.findIndex((p) => p.projectId === projectId || p.courseId === projectId);
    if (projectIndex === -1) throw new Error('Project not found');

    const stageIndex = list[projectIndex].modules.findIndex(
      (m) => m.stageId === stageId || m.moduleId === stageId
    );
    if (stageIndex === -1) throw new Error('Stage not found');

    list[projectIndex].modules[stageIndex] = {
      ...list[projectIndex].modules[stageIndex],
      ...updates,
    };
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return list[projectIndex];
  },

  deleteStage(projectId: string, stageId: string): HardwareProject {
    const list = this.getAllProjects();
    const projectIndex = list.findIndex((p) => p.projectId === projectId || p.courseId === projectId);
    if (projectIndex === -1) throw new Error('Project not found');

    list[projectIndex].modules = list[projectIndex].modules.filter(
      (m) => m.stageId !== stageId && m.moduleId !== stageId
    );
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return list[projectIndex];
  },

  resetToDefaults(): HardwareProject[] {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
    return SAMPLE_PROJECTS;
  },
};

