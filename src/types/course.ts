export interface HardwareItem {
  id: string;
  name: string;
  partNumber?: string;
  quantity: number;
  description: string;
  pinoutNotes?: string;
}

export interface WiringDiagram {
  id: string;
  title: string;
  diagramType: 'l298n-motor' | 'ultrasonic-divider' | 'servo-bus' | 'relay-pump';
  description: string;
  voltageWarning?: string;
  pinConnections: {
    from: string;
    to: string;
    signalType: 'PWM' | 'GPIO' | 'Power' | 'Ground' | 'Analog' | 'Serial';
    color: string;
  }[];
}

export interface CodeSnippet {
  id: string;
  filename: string;
  language: 'cpp' | 'python' | 'arduino' | 'rust';
  code: string;
  description: string;
}

export interface ProjectStage {
  stageId: string;
  moduleId: string; // compatibility with backend
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl: string;
  hardwareChecklist: HardwareItem[];
  wiringDiagrams: WiringDiagram[];
  codeSnippets: CodeSnippet[];
}

export type ProjectCategory = 
  | 'Prompting and Code'
  | 'How AI Thinks'
  | 'Space and Hardware'
  | 'Robot Kits'
  | 'Robotics'
  | 'Autonomous Vehicles'
  | 'IoT & Cloud'
  | 'Kinematics';

export interface HardwareProject {
  projectId: string;
  courseId: string; // compatibility with backend
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  hardwareKit: string;
  category: ProjectCategory;
  pathwayId?: string;
  accentColor: string;
  modules: ProjectStage[];
}

// Backward-compatibility aliases
export type Course = HardwareProject;
export type Module = ProjectStage;

export interface UserProgress {
  userId: string;
  courseId: string;
  completionPercentage: number;
  completedModules: string[];
  examScore?: number;
  certificateUrl?: string;
  lastUpdated?: string;
}
