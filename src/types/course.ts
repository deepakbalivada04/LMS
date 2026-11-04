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
  imageUrl: string;
  description: string;
  voltageWarning?: string;
}

export interface CodeSnippet {
  id: string;
  filename: string;
  language: 'cpp' | 'python' | 'arduino' | 'rust';
  code: string;
  description: string;
}

export interface Module {
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl: string; // HLS stream .m3u8 or MP4 fallback
  hardwareChecklist: HardwareItem[];
  wiringDiagrams: WiringDiagram[];
  codeSnippets: CodeSnippet[];
}

export interface Course {
  courseId: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  hardwareKit: string;
  thumbnailUrl: string;
  modules: Module[];
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completionPercentage: number;
  completedModules: string[];
  examScore?: number;
  certificateUrl?: string;
  lastUpdated?: string;
}

