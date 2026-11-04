import { HardwareProject } from '../types/course';
import { AuthUser } from '../types/auth';

export const DEMO_USERS: Record<string, AuthUser> = {
  student: {
    userId: 'usr_student_001',
    email: 'student@robotics.edu',
    name: 'Sannath Koushik',
    role: 'student',
    isMock: false,
  },
};

export const SAMPLE_PROJECTS: HardwareProject[] = [
  {
    projectId: 'crs-esp32-rover',
    courseId: 'crs-esp32-rover',
    title: 'Project 1: Autonomous Obstacle-Avoiding Rover Kit',
    description: 'Assemble a differential-drive 4WD robotic rover using the ESP32 microcontroller, L298N dual H-Bridge motor driver, HC-SR04 ultrasonic sonar, and 7.4V LiPo battery pack.',
    level: 'Intermediate',
    category: 'Autonomous Vehicles',
    hardwareKit: 'RoboRover Kit v2.4 (ESP32, L298N, TT Motors, Sonar, 2S LiPo)',
    accentColor: '#0ea5e9',
    modules: [
      {
        stageId: 'mod-1',
        moduleId: 'mod-1',
        title: 'Stage 1: Chassis Assembly & Dual Motor Driver Wiring',
        description: 'Mount the yellow gearbox DC motors, wire the L298N driver to ESP32 PWM pins, and establish a common ground with the LiPo battery.',
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
            description: 'High-torque 3V-6V DC geared motors with rubber wheels.',
          },
        ],
        wiringDiagrams: [
          {
            id: 'wd-1',
            title: 'ESP32 to L298N Motor Driver Wiring',
            diagramType: 'l298n-motor',
            description: 'Connect ESP32 PWM pins to L298N IN1-IN4. LiPo ground MUST be tied together with ESP32 GND for a common reference.',
            voltageWarning: 'WARNING: Never connect 7.4V battery power directly to ESP32 3.3V or VIN without the 5V regulator!',
            pinConnections: [
              { from: 'ESP32 GPIO 16', to: 'L298N IN1 (Motor A Forward)', signalType: 'PWM', color: '#0ea5e9' },
              { from: 'ESP32 GPIO 17', to: 'L298N IN2 (Motor A Reverse)', signalType: 'GPIO', color: '#38bdf8' },
              { from: 'ESP32 GPIO 18', to: 'L298N IN3 (Motor B Forward)', signalType: 'PWM', color: '#6366f1' },
              { from: 'ESP32 GPIO 19', to: 'L298N IN4 (Motor B Reverse)', signalType: 'GPIO', color: '#818cf8' },
              { from: 'ESP32 GND', to: 'L298N GND (Common Ground)', signalType: 'Ground', color: '#64748b' },
              { from: 'LiPo 7.4V (+)', to: 'L298N 12V Power Terminal', signalType: 'Power', color: '#f43f5e' },
              { from: 'LiPo GND (-)', to: 'L298N GND Terminal', signalType: 'Ground', color: '#0f172a' },
            ],
          },
        ],
        codeSnippets: [
          {
            id: 'snip-1',
            filename: 'rover_motor_control.ino',
            language: 'arduino',
            description: 'ESP32 hardware LEDC PWM initialization and differential steering routines.',
            code: `// ESP32 Rover Motor Driver PWM Control
#define PIN_IN1 16
#define PIN_IN2 17
#define PIN_IN3 18
#define PIN_IN4 19

const int pwmFreq = 20000;
const int pwmResolution = 8; // 0-255 duty cycle
const int channelA = 0;
const int channelB = 1;

void setup() {
  Serial.begin(115200);
  
  // Attach LEDC PWM channels to ESP32 pins
  ledcAttachChannel(PIN_IN1, pwmFreq, pwmResolution, channelA);
  ledcAttachChannel(PIN_IN3, pwmFreq, pwmResolution, channelB);
  
  pinMode(PIN_IN2, OUTPUT);
  pinMode(PIN_IN4, OUTPUT);

  // Initial Drive Forward at 75% speed
  digitalWrite(PIN_IN2, LOW);
  ledcWriteChannel(channelA, 190);
  
  digitalWrite(PIN_IN4, LOW);
  ledcWriteChannel(channelB, 190);
  
  Serial.println("RoboRover: Motors Initialized and Running!");
}

void loop() {
  // Navigation loop handled in Stage 2
}
`,
          },
        ],
      },
      {
        stageId: 'mod-2',
        moduleId: 'mod-2',
        title: 'Stage 2: Ultrasonic Sonar Sensor Calibration & Obstacle Avoidance',
        description: 'Mount the HC-SR04 sonar sensor on a pan-tilt bracket, wire the 5V-to-3.3V voltage divider on the Echo line, and implement acoustic spike rejection.',
        durationMinutes: 18,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        hardwareChecklist: [
          {
            id: 'hw-5',
            name: 'HC-SR04 Ultrasonic Sensor',
            quantity: 1,
            description: 'Sonar ranging sensor measuring distances from 2cm to 400cm.',
            pinoutNotes: 'VCC 5V, Trig to GPIO 5, Echo through 1k/2k voltage divider to GPIO 4.',
          },
          {
            id: 'hw-6',
            name: 'Resistors (1k Ohm & 2k Ohm)',
            quantity: 2,
            description: 'Voltage divider stepping 5V down to 3.3V logic for ESP32 safety.',
          },
        ],
        wiringDiagrams: [
          {
            id: 'wd-2',
            title: 'Sonar Sensor Voltage Divider Protection',
            diagramType: 'ultrasonic-divider',
            description: '5V Echo output stepped down through a 1k / 2k resistor divider to safeguard ESP32 3.3V inputs.',
            voltageWarning: 'ESP32 GPIO pins are strictly 3.3V logic! Exceeding 3.6V will permanently damage the silicon.',
            pinConnections: [
              { from: 'ESP32 5V VIN', to: 'HC-SR04 VCC', signalType: 'Power', color: '#f43f5e' },
              { from: 'ESP32 GPIO 5', to: 'HC-SR04 Trig', signalType: 'GPIO', color: '#0ea5e9' },
              { from: 'HC-SR04 Echo (5V)', to: '1k Resistor Input', signalType: 'Analog', color: '#f59e0b' },
              { from: 'Divider Node (3.3V)', to: 'ESP32 GPIO 4', signalType: 'GPIO', color: '#2bb398' },
              { from: '2k Resistor Leg', to: 'ESP32 GND', signalType: 'Ground', color: '#64748b' },
            ],
          },
        ],
        codeSnippets: [
          {
            id: 'snip-2',
            filename: 'sonar_avoidance.py',
            language: 'python',
            description: 'Median filter implementation for acoustic distance spike filtering.',
            code: `import statistics
import time

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

# Test run
sensor = SonarSensor()
for sample in [25.4, 26.1, 999.0, 25.8, 25.5]:
    print("Filtered Distance (cm):", sensor.add_reading(sample))
`,
          },
        ],
      },
    ],
  },
  {
    projectId: 'crs-robotic-arm-kinematics',
    courseId: 'crs-robotic-arm-kinematics',
    title: 'Project 2: 6-DOF Robotic Arm & Inverse Kinematics Kit',
    description: 'Construct a 6-axis articulated robotic arm using STS3215 high-torque serial bus servos. Implement forward and inverse kinematics using Denavit-Hartenberg matrices.',
    level: 'Advanced',
    category: 'Kinematics',
    hardwareKit: 'RoboArm Pro Kit (STS3215 Serial Bus Servos + Aluminium 6-Axis Frame)',
    accentColor: '#8b5cf6',
    modules: [
      {
        stageId: 'mod-arm-1',
        moduleId: 'mod-arm-1',
        title: 'Stage 1: UART Bus Protocol & Servo ID Assignment',
        description: 'Configure half-duplex UART serial communication, assign unique IDs to each servo, and zero out home positions.',
        durationMinutes: 30,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        hardwareChecklist: [
          {
            id: 'hw-arm-1',
            name: 'STS3215 Magnetic Encoder Serial Servos (30kg-cm)',
            quantity: 6,
            description: 'High-precision metal gear serial bus servos with position/torque feedback.',
            pinoutNotes: 'Half-duplex TTL single-wire UART at 1 Mbps.',
          },
          {
            id: 'hw-arm-2',
            name: '12V 5A DC Power Supply',
            quantity: 1,
            description: 'Dedicated high-current servo power rail.',
          },
        ],
        wiringDiagrams: [
          {
            id: 'wd-arm-1',
            title: 'Half-Duplex Serial Servo Daisy Chain',
            diagramType: 'servo-bus',
            description: 'Daisy-chain data signals across all 6 servos with common ground to the microcontroller.',
            voltageWarning: 'Ensure 12V servo bus does not back-feed into the 3.3V logic pin of the MCU.',
            pinConnections: [
              { from: 'MCU TX/RX (Half-Duplex)', to: 'Servo 1 Data Pin', signalType: 'Serial', color: '#8b5cf6' },
              { from: '12V Power Supply (+)', to: 'Servo Bus 12V Rail', signalType: 'Power', color: '#f43f5e' },
              { from: '12V Power Supply (-)', to: 'MCU GND & Servo GND', signalType: 'Ground', color: '#64748b' },
            ],
          },
        ],
        codeSnippets: [
          {
            id: 'snip-arm-1',
            filename: 'servo_bus_controller.cpp',
            language: 'cpp',
            description: 'Packet generation for STS3215 position read and write.',
            code: `#include <Arduino.h>

void setServoPosition(uint8_t id, uint16_t position, uint16_t timeMs) {
  uint8_t packet[10];
  packet[0] = 0xFF;
  packet[1] = 0xFF;
  packet[2] = id;
  packet[3] = 7; // Length
  packet[4] = 0x03; // Write instruction
  packet[5] = 0x2A; // Position register
  packet[6] = (position >> 8) & 0xFF;
  packet[7] = position & 0xFF;
  packet[8] = (timeMs >> 8) & 0xFF;
  packet[9] = timeMs & 0xFF;
  
  Serial1.write(packet, sizeof(packet));
}
`,
          },
        ],
      },
    ],
  },
  {
    projectId: 'crs-iot-greenhouse',
    courseId: 'crs-iot-greenhouse',
    title: 'Project 3: IoT Smart Greenhouse & Irrigation Kit',
    description: 'Wire capacitive soil moisture sensors, a 5V optocoupled relay, and submersible water pump. Publish telemetry to AWS IoT Core over MQTT.',
    level: 'Beginner',
    category: 'IoT & Cloud',
    hardwareKit: 'AgriBot Kit (ESP32, Capacitive Sensor, 5V Relay, Mini Water Pump)',
    accentColor: '#2bb398',
    modules: [
      {
        stageId: 'mod-gh-1',
        moduleId: 'mod-gh-1',
        title: 'Stage 1: Capacitive Moisture Sensing & Pump Relay Control',
        description: 'Read analog soil capacitance, calibrate dry vs wet soil thresholds, and pulse the relay safely.',
        durationMinutes: 20,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        hardwareChecklist: [
          {
            id: 'hw-gh-1',
            name: 'Capacitive Soil Moisture Sensor v1.2',
            quantity: 1,
            description: 'Corrosion-resistant analog capacitance sensor.',
          },
          {
            id: 'hw-gh-2',
            name: '1-Channel 5V Optocoupled Relay Module',
            quantity: 1,
            description: 'Isolates pump inductive flyback from microcontroller logic.',
          },
        ],
        wiringDiagrams: [
          {
            id: 'wd-gh-1',
            title: 'Optocoupled Relay & Flyback Diode Circuit',
            diagramType: 'relay-pump',
            description: 'Optocoupled relay isolation protecting MCU GPIO from pump coil spikes.',
            voltageWarning: 'Ensure flyback diode 1N4007 is across the DC pump motor terminals to clamp back-EMF.',
            pinConnections: [
              { from: 'ESP32 GPIO 25', to: 'Relay IN Pin', signalType: 'GPIO', color: '#2bb398' },
              { from: 'ESP32 3.3V', to: 'Moisture Sensor VCC', signalType: 'Power', color: '#f43f5e' },
              { from: 'Moisture Sensor AOUT', to: 'ESP32 ADC1_CH0 (GPIO 36)', signalType: 'Analog', color: '#0ea5e9' },
            ],
          },
        ],
        codeSnippets: [],
      },
    ],
  },
];

export const SAMPLE_COURSES = SAMPLE_PROJECTS; // Backward compatibility
