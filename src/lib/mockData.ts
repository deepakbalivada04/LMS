import { HardwareProject } from '../types/course';
import { AuthUser } from '../types/auth';

export const DEMO_USERS: Record<string, AuthUser> = {
  student: {
    userId: 'usr_student_master',
    email: 'student@robotics.edu',
    name: 'Sannath Koushik',
    role: 'student',
    isMock: false,
  },
};

// Canonical live S3 MediaConvert HLS streaming output
export const LIVE_S3_HLS_URL = 'https://robotics-lms-videos-processed-2026.s3.ap-southeast-2.amazonaws.com/projects/crs-esp32-rover/1793905763827-gemini_generated_video_fac0cdb7/hls/1793905763827-gemini_generated_video_fac0cdb7.m3u8';

export const SAMPLE_PROJECTS: HardwareProject[] = [
  // =========================================================================
  // CLUSTER 1: ROBOT KITS
  // =========================================================================
  {
    projectId: 'skill-assembling-first-robot',
    courseId: 'skill-assembling-first-robot',
    title: 'Assembling Your First Robot',
    description: 'Mount the dual yellow gearbox TT DC motors, align rubber wheels, fasten acrylic chassis plates, and wire the L298N driver for a differential-drive robot.',
    level: 'Beginner',
    category: 'Robot Kits',
    pathwayId: 'robot-kits',
    hardwareKit: 'RoboRover Kit v2.4 (Acrylic Chassis, TT Motors, L298N, 2S LiPo)',
    accentColor: '#dc2626',
    modules: [
      {
        stageId: 'stg-robot-1',
        moduleId: 'stg-robot-1',
        title: 'Stage 1: Mechanical Chassis Alignment & Wheel Mounting',
        description: 'Mount the DC gearbox motors, align wheels, and establish square mechanical geometry.',
        durationMinutes: 15,
        videoUrl: LIVE_S3_HLS_URL,
        hardwareChecklist: [
          { id: 'hw-ak-1', name: '4WD Laser-Cut Acrylic Chassis', quantity: 1, description: 'Dual-plate rigid chassis with M3 mounting holes.' },
          { id: 'hw-ak-2', name: 'Yellow TT DC Gearbox Motors (1:48)', quantity: 2, description: 'High-torque 3V-6V geared motors.' },
          { id: 'hw-ak-3', name: 'Rubber Grippy Wheels (65mm)', quantity: 2, description: 'High-traction rubber wheels.' },
          { id: 'hw-ak-4', name: 'Front Ball Caster Wheel', quantity: 1, description: 'Low-friction omnidirectional caster.' },
        ],
        wiringDiagrams: [],
        codeSnippets: [],
      },
      {
        stageId: 'stg-robot-2',
        moduleId: 'stg-robot-2',
        title: 'Stage 2: L298N Dual H-Bridge & LiPo Power Wiring',
        description: 'Wire high-current motor power rails and establish common logic ground reference.',
        durationMinutes: 20,
        videoUrl: 'https://robotics-lms-videos-processed-2026.s3.ap-southeast-2.amazonaws.com/projects/robot-kits/assembling-first-robot/stage2/hls/master.m3u8',
        hardwareChecklist: [
          { id: 'hw-ak-5', name: 'L298N Dual H-Bridge Module', quantity: 1, description: 'Controls motor direction and speed via PWM.' },
          { id: 'hw-ak-6', name: '7.4V 2S LiPo Battery 2200mAh', quantity: 1, description: 'High-discharge power source for DC motors.' },
        ],
        wiringDiagrams: [
          {
            id: 'wd-ak-1',
            title: 'L298N Motor Driver to LiPo & Common Ground',
            diagramType: 'l298n-motor',
            description: 'Wire LiPo 7.4V to L298N power terminal. Tie LiPo GND to microcontroller GND.',
            pinConnections: [
              { from: 'LiPo 7.4V (+)', to: 'L298N 12V Power Screw Terminal', signalType: 'Power', color: '#dc2626' },
              { from: 'LiPo GND (-)', to: 'L298N GND Screw Terminal', signalType: 'Ground', color: '#0f172a' },
              { from: 'MCU GND', to: 'L298N GND', signalType: 'Ground', color: '#64748b' },
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
    accentColor: '#dc2626',
    modules: [
      {
        stageId: 'stg-debug-1',
        moduleId: 'stg-debug-1',
        title: 'Stage 1: Multimeter Continuity & Common Ground Check',
        description: 'Verify continuity between MCU ground and driver ground. A floating ground is the #1 cause of dead robots.',
        durationMinutes: 7,
        videoUrl: LIVE_S3_HLS_URL,
        hardwareChecklist: [
          { id: 'hw-dbg-1', name: 'Digital Multimeter with Beep Continuity', quantity: 1, description: 'Tests resistance, continuity, and rail voltage.' },
          { id: 'hw-dbg-2', name: 'Alligator Clip Test Leads', quantity: 4, description: 'For hands-free voltage monitoring.' },
        ],
        wiringDiagrams: [],
        codeSnippets: [
          {
            id: 'snip-dbg-1',
            filename: 'motor_test_toggle.ino',
            language: 'arduino',
            description: 'Slow 2-second toggle to test motor driver outputs with a multimeter.',
            code: `void setup() {
  pinMode(16, OUTPUT);
  pinMode(17, OUTPUT);
}

void loop() {
  digitalWrite(16, HIGH);
  digitalWrite(17, LOW);
  delay(2000);
  digitalWrite(16, LOW);
  digitalWrite(17, HIGH);
  delay(2000);
}`,
          },
        ],
      },
      {
        stageId: 'stg-debug-2',
        moduleId: 'stg-debug-2',
        title: 'Stage 2: Measuring In-Rush Current & Voltage Sag',
        description: 'Measure motor start-up current spike to ensure the MCU 3.3V rail does not brown out.',
        durationMinutes: 18,
        videoUrl: 'https://robotics-lms-videos-processed-2026.s3.ap-southeast-2.amazonaws.com/projects/robot-kits/debugging-dead-robot/stage2/hls/master.m3u8',
        hardwareChecklist: [],
        wiringDiagrams: [],
        codeSnippets: [],
      },
    ],
  },

  // =========================================================================
  // CLUSTER 2: HOW AI THINKS
  // =========================================================================
  {
    projectId: 'skill-how-machine-picks-next-word',
    courseId: 'skill-how-machine-picks-next-word',
    title: 'How a Machine Picks the Next Word',
    description: 'Demystify Large Language Models and autoregressive token generation. Explore tokenization, embeddings, temperature sampling, and logits.',
    level: 'Beginner',
    category: 'How AI Thinks',
    pathwayId: 'how-ai-thinks',
    hardwareKit: 'Edge AI Compute Kit (Raspberry Pi 5 / Jetson Nano + OLED Display)',
    accentColor: '#991b1b',
    modules: [
      {
        stageId: 'stg-ai-1',
        moduleId: 'stg-ai-1',
        title: 'Stage 1: Tokenization, Vectors & Probability Distributions',
        description: 'How text is chopped into token IDs and converted into multi-dimensional vectors.',
        durationMinutes: 10,
        videoUrl: LIVE_S3_HLS_URL,
        hardwareChecklist: [
          { id: 'hw-ai-1', name: 'Microcontroller / Single Board Computer', quantity: 1, description: 'Runs token lookup table and tokenizer model.' },
        ],
        wiringDiagrams: [],
        codeSnippets: [
          {
            id: 'snip-ai-tok',
            filename: 'next_word_picker.py',
            language: 'python',
            description: 'Softmax probability calculation and temperature sampling.',
            code: `import math

def softmax(logits, temperature=1.0):
    exp_logits = [math.exp(x / temperature) for x in logits]
    total = sum(exp_logits)
    return [p / total for p in exp_logits]

# Candidate words: ["robot", "rover", "arm", "sensor"]
logits = [2.4, 3.1, 1.2, 0.5]
probs = softmax(logits, temperature=0.7)
print("Next Word Probabilities:", probs)`,
          },
        ],
      },
      {
        stageId: 'stg-ai-2',
        moduleId: 'stg-ai-2',
        title: 'Stage 2: Self-Attention & Query-Key-Value Matrix Math',
        description: 'Understand how attention matrices compute contextual relevance between words.',
        durationMinutes: 18,
        videoUrl: 'https://robotics-lms-videos-processed-2026.s3.ap-southeast-2.amazonaws.com/projects/how-ai-thinks/machine-picks-next-word/stage2/hls/master.m3u8',
        hardwareChecklist: [],
        wiringDiagrams: [],
        codeSnippets: [],
      },
    ],
  },
  {
    projectId: 'skill-computer-recognise-cat',
    courseId: 'skill-computer-recognise-cat',
    title: 'Teaching a Computer to Recognise a Cat',
    description: 'Learn Convolutional Neural Networks (CNN) from scratch: pixel matrices, kernel filters, edge detection, pooling, and running vision models on embedded cameras.',
    level: 'Intermediate',
    category: 'How AI Thinks',
    pathwayId: 'how-ai-thinks',
    hardwareKit: 'ESP32-CAM AI Vision Kit (OV2640 Camera, Pan-Tilt Servos, Red Laser)',
    accentColor: '#991b1b',
    modules: [
      {
        stageId: 'stg-vision-1',
        moduleId: 'stg-vision-1',
        title: 'Stage 1: Pixels to Convolutions (Sobel Edge Filters)',
        description: 'Pass 3x3 mathematical convolution kernels over pixels to identify edges, whiskers, and contours.',
        durationMinutes: 14,
        videoUrl: LIVE_S3_HLS_URL,
        hardwareChecklist: [
          { id: 'hw-cam-1', name: 'ESP32-CAM Module with OV2640', quantity: 1, description: 'Microcontroller with integrated 2MP camera sensor.' },
          { id: 'hw-cam-2', name: 'FTDI USB-to-UART Programmer', quantity: 1, description: 'Flashes firmware to ESP32-CAM via 3.3V TX/RX.' },
        ],
        wiringDiagrams: [],
        codeSnippets: [
          {
            id: 'snip-sobel',
            filename: 'edge_filter.py',
            language: 'python',
            description: 'Apply Sobel horizontal edge kernel filter to pixel array.',
            code: `sobel_x = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
]

def apply_kernel(image_patch, kernel):
    val = 0
    for r in range(3):
        for c in range(3):
            val += image_patch[r][c] * kernel[r][c]
    return abs(val)`,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // CLUSTER 3: SPACE AND HARDWARE
  // =========================================================================
  {
    projectId: 'skill-how-rover-finds-way',
    courseId: 'skill-how-rover-finds-way',
    title: 'How a Rover Finds Its Way',
    description: 'Autonomous exploration robotics: ultrasonic acoustic distance echo timing, wheel odometry encoder pulses, obstacle avoidance state machines, and micro-ROS.',
    level: 'Beginner',
    category: 'Space and Hardware',
    pathwayId: 'space-and-hardware',
    hardwareKit: 'Space Rover Kit (ESP32, HC-SR04 Sonar, Wheel Encoders, LiPo)',
    accentColor: '#b91c1c',
    modules: [
      {
        stageId: 'stg-rover-1',
        moduleId: 'stg-rover-1',
        title: 'Stage 1: Speed of Sound & Ultrasonic Sonar Echo Timing',
        description: 'Trigger a 10-microsecond acoustic pulse and calculate centimeter distance from echo duration.',
        durationMinutes: 11,
        videoUrl: LIVE_S3_HLS_URL,
        hardwareChecklist: [
          { id: 'hw-snr-1', name: 'HC-SR04 Ultrasonic Sonar Sensor', quantity: 1, description: 'Measures 2cm to 400cm via 40kHz acoustic pulses.' },
          { id: 'hw-snr-2', name: 'Voltage Divider Resistors (1k + 2k)', quantity: 2, description: 'Protects ESP32 3.3V pin from 5V Echo line.' },
        ],
        wiringDiagrams: [],
        codeSnippets: [
          {
            id: 'snip-distance',
            filename: 'sonar_distance.ino',
            language: 'arduino',
            description: 'Microsecond pulse measurement for distance calculation.',
            code: `const int trigPin = 5;
const int echoPin = 18;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.0343 / 2;
  Serial.printf("Distance: %.1f cm\\n", distanceCm);
  delay(100);
}`,
          },
        ],
      },
    ],
  },
  {
    projectId: 'skill-motors-torque-gears',
    courseId: 'skill-motors-torque-gears',
    title: 'Motors, Torque, and Why Gears Matter',
    description: 'Master rotational mechanics: gear ratios, trade-off between RPM and output torque, motor stall currents, and controlling 6-axis robotic arm actuators.',
    level: 'Intermediate',
    category: 'Space and Hardware',
    pathwayId: 'space-and-hardware',
    hardwareKit: '6-DOF Articulated Robotic Arm Kit (STS3215 Magnetic Servos + Aluminium Frame)',
    accentColor: '#b91c1c',
    modules: [
      {
        stageId: 'stg-torque-1',
        moduleId: 'stg-torque-1',
        title: 'Stage 1: Gear Ratio Math & Output Torque Multiplication',
        description: 'Why a 1:48 gearbox increases torque 48x while reducing shaft speed proportionally.',
        durationMinutes: 8,
        videoUrl: LIVE_S3_HLS_URL,
        hardwareChecklist: [
          { id: 'hw-tq-1', name: 'STS3215 High-Torque Serial Bus Servo (30kg-cm)', quantity: 1, description: 'Heavy-duty steel gear actuator with position telemetry.' },
          { id: 'hw-tq-2', name: '12V 5A High-Amperage Power Supply', quantity: 1, description: 'Powers servo bus without voltage drops.' },
        ],
        wiringDiagrams: [],
        codeSnippets: [],
      },
    ],
  },

  // =========================================================================
  // CLUSTER 4: PROMPTING AND CODE
  // =========================================================================
  {
    projectId: 'skill-first-prompt-works',
    courseId: 'skill-first-prompt-works',
    title: 'Your First Prompt That Works',
    description: 'Learn prompt engineering techniques for software and hardware developers: defining strict output formats, system roles, few-shot examples, and preventing hallucinations.',
    level: 'Beginner',
    category: 'Prompting and Code',
    pathwayId: 'prompting-and-code',
    hardwareKit: 'Web IDE Starter Kit (Google Blockly Visual Coding + Monaco Text Editor)',
    accentColor: '#b45309',
    modules: [
      {
        stageId: 'stg-prompt-1',
        moduleId: 'stg-prompt-1',
        title: 'Stage 1: Role, Context, Task & Constraint (RCTC Framework)',
        description: 'Structure your developer prompts to generate production-ready code with zero syntax errors.',
        durationMinutes: 9,
        videoUrl: LIVE_S3_HLS_URL,
        hardwareChecklist: [],
        wiringDiagrams: [],
        codeSnippets: [
          {
            id: 'snip-prompt-template',
            filename: 'prompt_template.md',
            language: 'python',
            description: 'Production prompt template for microcontroller code generation.',
            code: `# SYSTEM ROLE
You are an expert embedded C++ developer writing code for the ESP32.

# TASK
Write a non-blocking ultrasonic sensor reader using hardware interrupts.

# CONSTRAINTS
- Return ONLY valid C++ code inside a single markdown code fence.
- Do NOT use delay(). Use millis() timing loops.
- Include pin definitions for ESP32 GPIO 5 (TRIG) and GPIO 18 (ECHO).`,
          },
        ],
      },
    ],
  },
  {
    projectId: 'skill-code-snippets-reuse',
    courseId: 'skill-code-snippets-reuse',
    title: "Code Snippets You'll Reuse",
    description: 'Build a battle-tested library of embedded C++ patterns: non-blocking millis() schedulers, software debouncing, circular serial buffers, and PID motor controllers.',
    level: 'Intermediate',
    category: 'Prompting and Code',
    pathwayId: 'prompting-and-code',
    hardwareKit: 'ESP32 IoT Dev Kit (ESP-WROOM-32, USB-C Data Cable, Breadboard, LEDs)',
    accentColor: '#b45309',
    modules: [
      {
        stageId: 'stg-snippets-1',
        moduleId: 'stg-snippets-1',
        title: 'Stage 1: The Non-Blocking millis() State Scheduler',
        description: 'Never use delay() in robotics! Learn how to run motors, read sensors, and blink LEDs concurrently.',
        durationMinutes: 12,
        videoUrl: LIVE_S3_HLS_URL,
        hardwareChecklist: [
          { id: 'hw-snp-1', name: 'ESP32 DevKit V1 Board', quantity: 1, description: '38-pin dual-core development microcontroller.' },
        ],
        wiringDiagrams: [],
        codeSnippets: [
          {
            id: 'snip-millis',
            filename: 'async_scheduler.ino',
            language: 'arduino',
            description: 'Non-blocking task scheduler without delays.',
            code: `unsigned long lastSensorRead = 0;
unsigned long lastMotorUpdate = 0;

void setup() {
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();

  // Task 1: Read sensor every 100ms
  if (now - lastSensorRead >= 100) {
    lastSensorRead = now;
    readSonar();
  }

  // Task 2: Update motor PWM every 20ms
  if (now - lastMotorUpdate >= 20) {
    lastMotorUpdate = now;
    updateMotorControl();
  }
}

void readSonar() { /* Non-blocking echo */ }
void updateMotorControl() { /* Compute PID */ }`,
          },
        ],
      },
    ],
  },
];

export const SAMPLE_COURSES = SAMPLE_PROJECTS;
