import { HardwareProject, ProjectStage } from '../types/course';
import { SAMPLE_PROJECTS } from '../lib/mockData';

const PROJECTS_STORAGE_KEY = 'robolms_projects_registry';

export const projectService = {
  getAllProjects(): HardwareProject[] {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
        return SAMPLE_PROJECTS;
      }
      const parsed: HardwareProject[] = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
        return SAMPLE_PROJECTS;
      }
      return parsed;
    } catch {
      return SAMPLE_PROJECTS;
    }
  },

  getProjectById(id: string): HardwareProject | undefined {
    const list = this.getAllProjects();
    return list.find((p) => p.projectId === id || p.courseId === id);
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

