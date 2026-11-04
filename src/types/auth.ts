export type UserRole = 'guest' | 'student' | 'teacher' | 'admin';

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  status?: UserStatus;
  enrolledProjectIds?: string[];
  isMock?: boolean;
}

export interface UserRecord {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  enrolledProjectIds: string[];
  notes?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}
