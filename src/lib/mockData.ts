import { Course } from '../types/course';
import { AuthUser } from '../types/auth';

export const DEMO_USERS: Record<string, AuthUser> = {
  student: {
    userId: 'usr_student_001',
    email: 'alex.robotics@example.com',
    name: 'Alex Mercer (Student)',
    role: 'student',
    isMock: true,
  },
  admin: {
    userId: 'usr_admin_001',
    email: 'prof.elena@example.com',
    name: 'Dr. Elena Vance (Admin / Instructor)',
    role: 'admin',
    isMock: true,
  },
};

export const SAMPLE_COURSES: Course[] = [
  {
    courseId: 'crs-esp32-rover',
    title: 'Autonomous Rover with ESP32 & ROS2 Micro-XRCE',
    description: 'Design, wire, and program a 4-wheel differential drive rover equipped with ESP32, dual H-Bridge motor drivers, and ultrasonic obstacle avoidance.',
    level: 'Intermediate',
    hardwareKit: 'ESP32 Rover Kit Pro v2.4 (L298N, HC-SR04, LiPo 2S)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        moduleId: 'mod-1',
        title: 'Module 1: Chassis Assembly & Dual Motor Driver Wiring',
        description: 'Mount the DC geared motors, wire the L298N motor driver to ESP32 GPIOs, and establish safe common ground with the LiPo battery.',
        durationMinutes: 24,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        hardwareChecklist: [
          {
            id: 'hw-1',
            name: 'ESP32 NodeMCU-32S Board',
            partNumber: 'ESP-WROOM-32',
            quantity: 1,
            description: 'Dual-core MCU with built-in Wi-Fi and Bluetooth LE.',
            pinoutNotes: 'GPIO 16, 17, 18, 19 configured for PWM motor signals.',
          },
          {
            id: 'hw-2',
            name: 'L298N Dual H-Bridge Motor Driver',
            quantity: 1,
            description: 'Drives two DC motors with 5V onboard regulator capability.',
            pinoutNotes: 'Remove 5V enable jumper if powering motors > 12V.',
          },
          {
            id: 'hw-3',
            name: '7.4V 2S LiPo Battery 2200mAh',
            quantity: 1,
            description: 'Main high-discharge power rail for motors and regulated logic.',
            pinoutNotes: 'Ensure XT60 connector is properly seated before switching.',
          },
          {
            id: 'hw-4',
            name: 'Yellow TT Gearbox DC Motors (1:48)',
            quantity: 2,
            description: 'High torque 3V-6V DC geared motors with rubber wheels.',
          },
        ],
        wiringDiagrams: [
          {
            id: 'wd-1',
            title: 'ESP32 to L298N Schematic',
            imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80',
            description: 'Connect ESP32 GPIO16 -> IN1, GPIO17 -> IN2, GPIO18 -> IN3, GPIO19 -> IN4. Common Ground tied between ESP32 and LiPo GND.',
            voltageWarning: 'WARNING: Never connect 7.4V motor voltage directly to ESP32 3.3V or 5V VIN without a voltage regulator!',
          },
        ],
        codeSnippets: [
          {
            id: 'snip-1',
            filename: 'motor_driver_esp32.ino',
            language: 'arduino',
            description: 'LED control & Dual PWM initialization with ESP32 ledc library.',
            code: `// Motor Driver ESP32 PWM Control
#define PIN_IN1 16
#define PIN_IN2 17
#define PIN_IN3 18
#define PIN_IN4 19

const int freq = 20000;
const int pwmChannelA = 0;
const int pwmChannelB = 1;
const int resolution = 8; // 0-255 duty cycle

void setup() {
  Serial.begin(115200);
  ledcAttachChannel(PIN_IN1, freq, resolution, pwmChannelA);
  ledcAttachChannel(PIN_IN3, freq, resolution, pwmChannelB);
  pinMode(PIN_IN2, OUTPUT);
  pinMode(PIN_IN4, OUTPUT);

  // Set initial Forward motion
  digitalWrite(PIN_IN2, LOW);
  ledcWriteChannel(pwmChannelA, 200); // 78% duty cycle
  
  digitalWrite(PIN_IN4, LOW);
  ledcWriteChannel(pwmChannelB, 200);
  Serial.println("Rover Motors Initialized!");
}

void loop() {
  // Motor control loop runs in Phase 2
}
`,
          },
        ],
      },
      {
        moduleId: 'mod-2',
        title: 'Module 2: Ultrasonic Sensor Calibration & Range Filtering',
        description: 'Mount HC-SR04 sonar sensor on a pan-tilt servo bracket and implement a median filter to reject acoustic echo spikes.',
        durationMinutes: 18,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        hardwareChecklist: [
          {
            id: 'hw-5',
            name: 'HC-SR04 Ultrasonic Sensor (or RCWL-9610 3.3V version)',
            quantity: 1,
            description: 'Non-contact sonar ranging module from 2cm to 400cm.',
            pinoutNotes: 'VCC 5V, Trig to GPIO 5, Echo with 1k/2k voltage divider to GPIO 18.',
          },
        ],
        wiringDiagrams: [
          {
            id: 'wd-2',
            title: 'Sonar Sensor Voltage Divider Circuit',
            imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            description: '5V Echo output stepped down to 3.3V safe logic for ESP32 inputs.',
            voltageWarning: 'ESP32 GPIO pins are NOT 5V tolerant. Exceeding 3.6V will damage the SoC.',
          },
        ],
        codeSnippets: [
          {
            id: 'snip-2',
            filename: 'sonar_filter.py',
            language: 'python',
            description: 'Median filter implementation for distance smoothing.',
            code: `import statistics

class SonarSensor:
    def __init__(self, window_size=5):
        self.buffer = []
        self.window_size = window_size

    def add_reading(self, raw_cm):
        if 2.0 <= raw_cm <= 400.0:
            self.buffer.append(raw_cm)
            if len(self.buffer) > self.window_size:
                self.buffer.pop(0)
        return self.filtered_distance()

    def filtered_distance(self):
        if not self.buffer:
            return -1.0
        return statistics.median(self.buffer)
`,
          },
        ],
      },
    ],
  },
  {
    courseId: 'crs-robotic-arm-kinematics',
    title: '6-DOF Robotic Arm Kinematics & Servo Bus Control',
    description: 'Master forward and inverse kinematics using Denavit-Hartenberg (DH) parameters, wiring high-torque serial bus servos, and trajectory planning.',
    level: 'Advanced',
    hardwareKit: 'STS3215 Serial Bus Servos + Aluminium 6-DOF Robotic Arm Frame',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        moduleId: 'mod-arm-1',
        title: 'Module 1: UART Bus Protocol & Servo ID Assignment',
        description: 'Configure half-duplex UART communication, assign individual hex IDs, and calibrate zero positions.',
        durationMinutes: 30,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        hardwareChecklist: [],
        wiringDiagrams: [],
        codeSnippets: [],
      },
    ],
  },
];

