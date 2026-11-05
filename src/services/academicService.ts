export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  category?: string;
  rubric?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentEmail: string;
  studentName: string;
  submissionUrl: string;
  notes?: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  grade?: number; // e.g. 95 out of 100
  feedback?: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  category: string;
  timeLimitMinutes: number;
  passPercentage: number;
  questions: QuizQuestion[];
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  score: number;
  certificatePdfUrl?: string;
}

const STORAGE_KEYS = {
  ASSIGNMENTS: 'robolms_assignments_registry',
  SUBMISSIONS: 'robolms_submissions_registry',
  QUIZZES: 'robolms_quizzes_registry',
  CERTIFICATES: 'robolms_certificates_registry',
};

// Initial Seed Data (Only if storage is empty)
const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    courseId: 'crs-esp32-rover',
    courseTitle: 'Autonomous Obstacle-Avoiding Rover Kit',
    title: 'Dual Motor L298N Wiring & Common Ground Verification',
    description: 'Verify wiring from ESP32 PWM pins to L298N motor driver inputs. Ensure LiPo GND is tied together with MCU GND.',
    dueDate: '2026-11-12',
    points: 100,
    category: 'Hardware & Wiring',
    rubric: 'Common ground established (30pts), PWM speed control verified (40pts), Heat dissipation check (30pts)',
  },
  {
    id: 'asg-2',
    courseId: 'crs-esp32-rover',
    courseTitle: 'Autonomous Obstacle-Avoiding Rover Kit',
    title: 'Ultrasonic Sonar Echo 3.3V Voltage Divider Protection',
    description: 'Calculate and solder 1kΩ / 2kΩ resistor divider to step down HC-SR04 5V Echo pulse before it reaches GPIO 18.',
    dueDate: '2026-11-16',
    points: 100,
    category: 'Circuit Protection',
    rubric: 'Voltage measurement under 3.3V (50pts), Clean soldering / breadboard layout (50pts)',
  },
  {
    id: 'asg-3',
    courseId: 'crs-esp32-rover',
    courseTitle: 'Autonomous Obstacle-Avoiding Rover Kit',
    title: 'Obstacle Detection State Machine & Turn Trajectory Run',
    description: 'Record a 30-second continuous run of the rover detecting a wall at 20cm, executing reverse-turn, and resuming cruise.',
    dueDate: '2026-11-20',
    points: 100,
    category: 'Autonomous Control',
    rubric: 'Zero collisions (40pts), Smooth pivot maneuver (30pts), Sonar response time (30pts)',
  },
  {
    id: 'asg-4',
    courseId: 'skill-debugging-dead-robot',
    courseTitle: 'Debugging a Robot That Won\'t Move',
    title: 'Multimeter Voltage Rail & Short Circuit Diagnostics',
    description: 'Measure voltage drop across motor terminals under stall current. Record continuity beep checks across battery switches.',
    dueDate: '2026-11-25',
    points: 100,
    category: 'Diagnostics',
    rubric: 'Accurate voltage drop log (50pts), Identification of high-resistance joints (50pts)',
  },
];

const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-1',
    studentEmail: 'sannathkoushik@gmail.com',
    studentName: 'Sannath Koushik',
    submissionUrl: 'https://youtu.be/sample-l298n-wiring-test',
    notes: 'Tied common ground rail to battery negative. PWM running at 1500Hz with zero motor whine.',
    submittedAt: '2026-11-04T14:20:00Z',
    status: 'graded',
    grade: 96,
    feedback: 'Flawless common ground implementation. Neat zip-tie cable management.',
  },
];

const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'crs-esp32-rover',
    courseId: 'crs-esp32-rover',
    title: 'Autonomous Obstacle-Avoiding Rover Kit Evaluation',
    category: 'Robot Kits',
    timeLimitMinutes: 20,
    passPercentage: 80,
    questions: [
      {
        id: 'q-esp32-voltage',
        questionText: 'What is the maximum safe DC logic voltage for ESP32 GPIO input pins?',
        options: ['5.0 Volts', '3.3 Volts', '1.8 Volts', '12.0 Volts'],
        correctOptionIndex: 1,
        explanation: 'ESP32 pins operate at 3.3V logic. Feeding 5V directly from an HC-SR04 sonar echo pin will permanently degrade GPIO input gates.',
      },
      {
        id: 'q-l298n-hbridge',
        questionText: 'How is differential speed steering achieved with an L298N dual H-Bridge?',
        options: [
          'By changing the battery chemistry',
          'By using an analog potentiometer on the battery positive wire',
          'By applying differing PWM duty cycles to the left and right motor enable pins',
          'By turning off the microcontroller',
        ],
        correctOptionIndex: 2,
        explanation: 'Different PWM duty cycles vary the average voltage across each motor, causing differential skid steering.',
      },
      {
        id: 'q-common-ground',
        questionText: 'Why MUST the ESP32 Ground and the LiPo motor battery negative be physically connected?',
        options: [
          'To increase total system current capacity',
          'To double the voltage output',
          'To establish a shared 0V reference potential for PWM logic signals',
          'It is not needed; motors run wirelessly',
        ],
        correctOptionIndex: 2,
        explanation: 'Without a common ground, logic high and low voltage signals lack a return reference and float unpredictably.',
      },
      {
        id: 'q-sonar-filter',
        questionText: 'Which software filter is best suited to reject false acoustic echo reflections from an ultrasonic sensor?',
        options: ['Median Filter', 'High-Pass RC Filter', 'FFT Transform', 'Random Jitter Noise'],
        correctOptionIndex: 0,
        explanation: 'Median filters reject transient acoustic spikes (like 0cm or 3000cm outliers) without phase lag.',
      },
    ],
  },
  {
    id: 'skill-debugging-dead-robot',
    courseId: 'skill-debugging-dead-robot',
    title: 'Debugging a Dead Robot: Voltage Drops & Continuity',
    category: 'Diagnostics',
    timeLimitMinutes: 15,
    passPercentage: 80,
    questions: [
      {
        id: 'q-dbg-1',
        questionText: 'When testing a motor that does not spin, what is the first multimeter check?',
        options: ['Measure AC frequency', 'Measure DC voltage directly at motor terminals under load', 'Replace the chassis', 'Short the battery terminals'],
        correctOptionIndex: 1,
        explanation: 'Checking terminal voltage under load reveals whether power is reaching the actuator or dropping across a bad switch.',
      },
      {
        id: 'q-dbg-2',
        questionText: 'What does a multimeter reading of 0.2 ohms in continuity mode indicate across a power switch?',
        options: ['The switch is open/blown', 'The switch has low resistance and is conducting properly', 'The multimeter battery is low', 'A short circuit to mains AC'],
        correctOptionIndex: 1,
        explanation: '0.2 ohms is near-zero resistance, confirming normal closed continuity.',
      },
    ],
  },
];

const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-1',
    certificateNumber: 'ROBO-CERT-2026-ESP32',
    studentEmail: 'sannathkoushik@gmail.com',
    studentName: 'Sannath Koushik',
    courseId: 'crs-esp32-rover',
    courseTitle: 'Autonomous Robotics & Hardware Systems',
    issuedAt: '2026-11-04T18:00:00Z',
    score: 96,
  },
];

export const academicService = {
  // ==========================================
  // ASSIGNMENTS
  // ==========================================
  getAllAssignments(): Assignment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
        return INITIAL_ASSIGNMENTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  },

  getAssignmentsForCourse(courseId: string): Assignment[] {
    return this.getAllAssignments().filter((a) => a.courseId === courseId);
  },

  createAssignment(assignment: Omit<Assignment, 'id'>): Assignment {
    const list = this.getAllAssignments();
    const newAssignment: Assignment = {
      ...assignment,
      id: `asg-${Date.now()}`,
    };
    list.push(newAssignment);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
    return newAssignment;
  },

  updateAssignment(id: string, updates: Partial<Assignment>): Assignment {
    const list = this.getAllAssignments();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Assignment ${id} not found.`);
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
    return updated;
  },

  deleteAssignment(id: string): void {
    const list = this.getAllAssignments().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
  },

  // ==========================================
  // ASSIGNMENT SUBMISSIONS
  // ==========================================
  getAllSubmissions(): AssignmentSubmission[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
        return INITIAL_SUBMISSIONS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  },

  getSubmissionsForStudent(email: string): AssignmentSubmission[] {
    const clean = email.toLowerCase().trim();
    return this.getAllSubmissions().filter((s) => s.studentEmail.toLowerCase() === clean);
  },

  submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>): AssignmentSubmission {
    const list = this.getAllSubmissions();
    const newSub: AssignmentSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };
    // Replace if already submitted for this assignment by this student
    const existingIndex = list.findIndex(
      (s) => s.assignmentId === submission.assignmentId && s.studentEmail.toLowerCase() === submission.studentEmail.toLowerCase()
    );
    if (existingIndex >= 0) {
      list[existingIndex] = newSub;
    } else {
      list.push(newSub);
    }
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    return newSub;
  },

  gradeSubmission(submissionId: string, grade: number, feedback?: string): AssignmentSubmission {
    const list = this.getAllSubmissions();
    const index = list.findIndex((s) => s.id === submissionId);
    if (index === -1) throw new Error(`Submission ${submissionId} not found.`);
    const updated: AssignmentSubmission = {
      ...list[index],
      grade,
      feedback: feedback || list[index].feedback,
      status: 'graded',
    };
    list[index] = updated;
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    return updated;
  },

  // ==========================================
  // QUIZZES
  // ==========================================
  getAllQuizzes(): Quiz[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
        return INITIAL_QUIZZES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_QUIZZES;
    }
  },

  getQuizByCourseId(courseId: string): Quiz | undefined {
    return this.getAllQuizzes().find((q) => q.courseId === courseId || q.id === courseId);
  },

  createQuiz(quiz: Omit<Quiz, 'id'>): Quiz {
    const list = this.getAllQuizzes();
    const newQuiz: Quiz = {
      ...quiz,
      id: quiz.courseId || `quiz-${Date.now()}`,
    };
    list.push(newQuiz);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(list));
    return newQuiz;
  },

  updateQuiz(id: string, updates: Partial<Quiz>): Quiz {
    const list = this.getAllQuizzes();
    const index = list.findIndex((q) => q.id === id);
    if (index === -1) throw new Error(`Quiz ${id} not found.`);
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(list));
    return updated;
  },

  deleteQuiz(id: string): void {
    const list = this.getAllQuizzes().filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(list));
  },

  // ==========================================
  // CERTIFICATES
  // ==========================================
  getAllCertificates(): CertificateRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
        return INITIAL_CERTIFICATES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_CERTIFICATES;
    }
  },

  getCertificatesForStudent(email: string): CertificateRecord[] {
    const clean = email.toLowerCase().trim();
    return this.getAllCertificates().filter((c) => c.studentEmail.toLowerCase() === clean);
  },

  issueCertificate(record: Omit<CertificateRecord, 'id' | 'issuedAt' | 'certificateNumber'>): CertificateRecord {
    const list = this.getAllCertificates();
    const certNum = `ROBO-CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newCert: CertificateRecord = {
      ...record,
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      issuedAt: new Date().toISOString(),
    };
    list.unshift(newCert);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(list));
    return newCert;
  },

  revokeCertificate(id: string): void {
    const list = this.getAllCertificates().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(list));
  },
};

