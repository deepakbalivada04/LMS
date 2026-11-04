export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  isMock?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

