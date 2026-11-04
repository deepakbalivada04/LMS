import { UserRecord, UserRole, UserStatus } from '../types/auth';
import { awsConfig } from '../aws-exports';

const USERS_STORAGE_KEY = 'robolms_users_registry';

const SUPER_ADMIN_EMAIL = awsConfig.adminEmail.toLowerCase();

// Initial seed
const INITIAL_USERS: UserRecord[] = [
  {
    userId: 'usr_admin_master',
    email: SUPER_ADMIN_EMAIL,
    name: 'Sannath Koushik',
    role: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
    enrolledProjectIds: ['crs-esp32-rover', 'crs-robotic-arm-kinematics', 'crs-iot-greenhouse'],
    notes: 'Super Administrator & Hardware Lab Director',
  },
  {
    userId: 'usr_guest_demo1',
    email: 'kiran.robotics@gmail.com',
    name: 'Kiran Patel',
    role: 'guest',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    enrolledProjectIds: [],
    notes: 'Awaiting admin approval for ESP32 Rover hardware kit.',
  },
  {
    userId: 'usr_guest_demo2',
    email: 'ananya.embedded@outlook.com',
    name: 'Ananya Sharma',
    role: 'guest',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    enrolledProjectIds: [],
    notes: 'Registered for 6-DOF Robotic Arm Lab.',
  },
  {
    userId: 'usr_student_demo3',
    email: 'rahul.iot@edu.in',
    name: 'Rahul Verma',
    role: 'student',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    enrolledProjectIds: ['crs-esp32-rover', 'crs-iot-greenhouse'],
    notes: 'Enrolled student - kit dispatched.',
  },
];

export const userService = {
  getAllUsers(): UserRecord[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      const users: UserRecord[] = JSON.parse(stored);
      // Ensure super admin always exists
      const hasSuperAdmin = users.some((u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL);
      if (!hasSuperAdmin) {
        users.unshift(INITIAL_USERS[0]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
      return users;
    } catch {
      return INITIAL_USERS;
    }
  },

  getUserByEmail(email: string): UserRecord | undefined {
    const users = this.getAllUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  /**
   * Called whenever a user signs up or signs in.
   * If it's the super admin email, guarantee role: 'admin'.
   * Otherwise, if user doesn't exist, register them as 'guest' (preview) with status 'pending'.
   */
  registerOrUpdateUser(input: { email: string; name?: string; userId?: string }): UserRecord {
    const users = this.getAllUsers();
    const cleanEmail = input.email.toLowerCase().trim();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    const isSuperAdmin = cleanEmail === SUPER_ADMIN_EMAIL;

    if (existingIndex >= 0) {
      const existing = users[existingIndex];
      const updated: UserRecord = {
        ...existing,
        name: input.name || existing.name,
        role: isSuperAdmin ? 'admin' : existing.role,
        status: isSuperAdmin ? 'approved' : existing.status,
      };
      users[existingIndex] = updated;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return updated;
    }

    const newUser: UserRecord = {
      userId: input.userId || `usr_${Date.now()}`,
      email: cleanEmail,
      name: input.name || cleanEmail.split('@')[0],
      role: isSuperAdmin ? 'admin' : 'guest',
      status: isSuperAdmin ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      enrolledProjectIds: isSuperAdmin ? ['crs-esp32-rover', 'crs-robotic-arm-kinematics', 'crs-iot-greenhouse'] : [],
      notes: isSuperAdmin ? 'Super Administrator' : 'Self-registered website user (guest preview)',
    };

    users.unshift(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  /**
   * Admin approves a user and upgrades role to student or teacher
   */
  updateUserRole(email: string, role: UserRole, status: UserStatus = 'approved'): UserRecord {
    const users = this.getAllUsers();
    const cleanEmail = email.toLowerCase().trim();
    const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (index === -1) {
      throw new Error(`User ${email} not found.`);
    }

    // Default enrollment when upgraded to student if none existed
    let enrolledProjectIds = users[index].enrolledProjectIds;
    if (role === 'student' && (!enrolledProjectIds || enrolledProjectIds.length === 0)) {
      enrolledProjectIds = ['crs-esp32-rover'];
    }

    const updated: UserRecord = {
      ...users[index],
      role,
      status,
      enrolledProjectIds,
    };

    users[index] = updated;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return updated;
  },

  /**
   * Admin assigns specific hardware kit projects to a student
   */
  updateUserEnrollments(email: string, projectIds: string[]): UserRecord {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (index === -1) throw new Error('User not found');

    const updated: UserRecord = {
      ...users[index],
      enrolledProjectIds: projectIds,
    };

    users[index] = updated;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return updated;
  },

  /**
   * Admin generates/creates new credentials for student or teacher
   */
  createUserByAdmin(input: {
    name: string;
    email: string;
    role: UserRole;
    projectIds?: string[];
    notes?: string;
  }): UserRecord {
    const users = this.getAllUsers();
    const cleanEmail = input.email.toLowerCase().trim();

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return this.updateUserRole(cleanEmail, input.role, 'approved');
    }

    const newUser: UserRecord = {
      userId: `usr_admin_${Date.now()}`,
      email: cleanEmail,
      name: input.name,
      role: input.role,
      status: 'approved',
      createdAt: new Date().toISOString(),
      enrolledProjectIds: input.projectIds && input.projectIds.length > 0 ? input.projectIds : ['crs-esp32-rover'],
      notes: input.notes || `Created directly by Admin on ${new Date().toLocaleDateString()}`,
    };

    users.unshift(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  deleteUser(email: string): boolean {
    const users = this.getAllUsers();
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === SUPER_ADMIN_EMAIL) {
      throw new Error('Cannot delete Super Admin account.');
    }
    const filtered = users.filter((u) => u.email.toLowerCase() !== cleanEmail);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  getPendingApprovalsCount(): number {
    const users = this.getAllUsers();
    return users.filter((u) => u.status === 'pending' || u.role === 'guest').length;
  },
};

