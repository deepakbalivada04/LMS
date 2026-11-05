import { HardwareProject, ProjectStage } from '../types/course';
import { userService } from './userService';

const PROJECTS_STORAGE_KEY = 'robolms_projects_registry';

// Real live AWS S3 MediaConvert HLS streaming endpoint from user's processed bucket
const LIVE_S3_PROCESSED_URL = 'https://robotics-lms-videos-processed-2026.s3.ap-southeast-2.amazonaws.com/projects/crs-esp32-rover/1793905763827-gemini_generated_video_fac0cdb7/hls/1793905763827-gemini_generated_video_fac0cdb7.m3u8';

// Production initial courses connected to real AWS S3 assets
const PRODUCTION_INITIAL_PROJECTS: HardwareProject[] = [
  {
    projectId: 'crs-esp32-rover',
    courseId: 'crs-esp32-rover',
    title: 'Autonomous Obstacle-Avoiding Rover Kit',
    description: 'Assemble an ESP32 differential-drive mobile rover, interface dual DC motors with L298N H-Bridge, and program ultrasonic sensor obstacle avoidance algorithms.',
    level: 'Intermediate',
    category: 'Robot Kits',
    pathwayId: 'robot-kits',
    hardwareKit: 'RoboRover Kit v2.4 (ESP32, L298N, TT Motors, Sonar, 2S LiPo)',
    accentColor: '#4f46e5',
    modules: [
      {
        stageId: 'stg-rover-1',
        moduleId: 'stg-rover-1',
        title: 'Stage 1: Chassis Assembly & Dual Motor Driver Wiring',
        description: 'Mount the yellow gearbox DC motors, wire the L298N driver to ESP32 PWM pins, and establish a common ground with the LiPo battery.',
        durationMinutes: 24,
        videoUrl: LIVE_S3_PROCESSED_URL,
        hardwareChecklist: [
          { id: 'hw-1', name: 'ESP32 NodeMCU Development Board', quantity: 1, description: 'Dual-core 240MHz microcontroller with Wi-Fi & Bluetooth.' },
          { id: 'hw-2', name: 'L298N Dual H-Bridge Motor Driver', quantity: 1, description: 'Drives high-current DC motors via PWM logic.' },
          { id: 'hw-3', name: 'Yellow TT DC Gearbox Motors (1:48)', quantity: 2, description: 'High-torque geared motors.' },
          { id: 'hw-4', name: '7.4V 2S LiPo Battery 2200mAh', quantity: 1, description: 'Main motor power rail.' },
        ],
        wiringDiagrams: [
          {
            id: 'wd-1',
            title: 'L298N to ESP32 & Common Ground',
            diagramType: 'l298n-motor',
            description: 'Connect ESP32 GPIO 16, 17, 18, 19 to L298N IN1-IN4. Tie LiPo GND to ESP32 GND.',
            pinConnections: [
              { from: 'ESP32 GPIO 16 (PWM)', to: 'L298N IN1 (Left Fwd)', signalType: 'PWM', color: '#0ea5e9' },
              { from: 'ESP32 GPIO 17 (PWM)', to: 'L298N IN2 (Left Rev)', signalType: 'PWM', color: '#0ea5e9' },
              { from: 'ESP32 GPIO 18 (PWM)', to: 'L298N IN3 (Right Fwd)', signalType: 'PWM', color: '#6366f1' },
              { from: 'ESP32 GPIO 19 (PWM)', to: 'L298N IN4 (Right Rev)', signalType: 'PWM', color: '#6366f1' },
              { from: 'ESP32 GND', to: 'L298N GND Rail (Common 0V Reference)', signalType: 'Ground', color: '#0f172a' },
              { from: 'LiPo 7.4V (+)', to: 'L298N 12V Screw Terminal', signalType: 'Power', color: '#ef4444' },
            ],
          },
        ],
        codeSnippets: [
          {
            id: 'cs-1',
            filename: 'motor_driver_pwm.cpp',
            language: 'cpp',
            description: 'ESP32 LEDC hardware PWM motor speed controller',
            code: `#include <Arduino.h>\n\n#define MOTOR_LEFT_FWD  16\n#define MOTOR_LEFT_REV  17\n#define MOTOR_RIGHT_FWD 18\n#define MOTOR_RIGHT_REV 19\n\nvoid setup() {\n  ledcAttach(MOTOR_LEFT_FWD, 2000, 8);\n  ledcAttach(MOTOR_RIGHT_FWD, 2000, 8);\n}\n\nvoid loop() {\n  ledcWrite(MOTOR_LEFT_FWD, 200); // 80% duty cycle\n  ledcWrite(MOTOR_RIGHT_FWD, 200);\n  delay(2000);\n}`,
          },
        ],
      },
      {
        stageId: 'stg-rover-2',
        moduleId: 'stg-rover-2',
        title: 'Stage 2: Ultrasonic Sonar Echo Divider & Obstacle Avoidance',
        description: 'Protect the 3.3V ESP32 GPIO with a resistor voltage divider from the 5V HC-SR04 Echo pin, and implement reactive collision avoidance.',
        durationMinutes: 18,
        videoUrl: LIVE_S3_PROCESSED_URL,
        hardwareChecklist: [
          { id: 'hw-5', name: 'HC-SR04 Ultrasonic Sonar Sensor', quantity: 1, description: 'Measures distances from 2cm to 400cm.' },
          { id: 'hw-6', name: '1kΩ & 2kΩ Resistors', quantity: 2, description: 'Voltage divider stepping down 5V Echo to 3.3V safe logic.' },
        ],
        wiringDiagrams: [
          {
            id: 'wd-2',
            title: 'Sonar 5V to 3.3V Voltage Divider',
            diagramType: 'ultrasonic-divider',
            description: 'Echo pin -> 1kΩ -> ESP32 GPIO 15 -> 2kΩ -> GND.',
            pinConnections: [
              { from: 'ESP32 5V / VBUS', to: 'HC-SR04 VCC (5V)', signalType: 'Power', color: '#ef4444' },
              { from: 'ESP32 GPIO 4', to: 'HC-SR04 Trig', signalType: 'GPIO', color: '#0ea5e9' },
              { from: 'HC-SR04 Echo (5V)', to: '1kΩ Resistor Input', signalType: 'GPIO', color: '#f59e0b' },
              { from: '1kΩ / 2kΩ Node (3.3V)', to: 'ESP32 GPIO 15 (Safe Input)', signalType: 'GPIO', color: '#10b981' },
              { from: '2kΩ Resistor Bottom', to: 'Common GND Rail', signalType: 'Ground', color: '#0f172a' },
            ],
          },
        ],
        codeSnippets: [],
      },
    ],
  },
  {
    projectId: 'skill-debugging-dead-robot',
    courseId: 'skill-debugging-dead-robot',
    title: "Debugging a Robot That Won't Move",
    description: 'Diagnose non-responsive robots using multimeter continuity tests, detect common-ground voltage drops, check PWM driver signals, and isolate brownouts.',
    level: 'Intermediate',
    category: 'Robot Kits',
    pathwayId: 'robot-kits',
    hardwareKit: 'Robotics Diagnostic Pack (Digital Multimeter, Logic Probes, Shunt Resistor)',
    accentColor: '#0ea5e9',
    modules: [
      {
        stageId: 'stg-debug-1',
        moduleId: 'stg-debug-1',
        title: 'Stage 1: Multimeter Continuity & Common Ground Check',
        description: 'Verify continuity between MCU ground and driver ground. A floating ground is the #1 cause of dead robots.',
        durationMinutes: 12,
        videoUrl: LIVE_S3_PROCESSED_URL,
        hardwareChecklist: [
          { id: 'hw-dbg-1', name: 'Digital Multimeter with Beep Continuity', quantity: 1, description: 'Tests resistance, continuity, and rail voltage.' },
        ],
        wiringDiagrams: [],
        codeSnippets: [],
      },
    ],
  },
];

export const projectService = {
  getAllProjects(): HardwareProject[] {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(PRODUCTION_INITIAL_PROJECTS));
        return PRODUCTION_INITIAL_PROJECTS;
      }
      const parsed: HardwareProject[] = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(PRODUCTION_INITIAL_PROJECTS));
        return PRODUCTION_INITIAL_PROJECTS;
      }
      return parsed;
    } catch {
      return PRODUCTION_INITIAL_PROJECTS;
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

    // 3. Cluster pathway match (e.g. 'robot-kits')
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

    const normalized: HardwareProject = {
      ...project,
      courseId: project.projectId,
      modules: (project.modules || []).map((m) => ({
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
};
