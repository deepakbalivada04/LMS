import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signIn as amplifySignIn, 
  signUp as amplifySignUp, 
  confirmSignUp as amplifyConfirmSignUp, 
  signOut as amplifySignOut, 
  getCurrentUser, 
  fetchUserAttributes, 
  fetchAuthSession 
} from 'aws-amplify/auth';
import { awsConfig } from '../aws-exports';
import { AuthUser, UserRole, SignUpData } from '../types/auth';
import { DEMO_USERS } from '../lib/mockData';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  role: UserRole;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: SignUpData) => Promise<{ isSignUpComplete: boolean; userId?: string }>;
  confirmRegistration: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchMockRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'robolms_mock_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMockMode = !awsConfig.isConfigured;

  // Extract role from Cognito groups or custom:role attribute
  const resolveRoleFromCognito = (attributes: Record<string, string | undefined>, session: any): UserRole => {
    // 1. Check custom attribute custom:role
    if (attributes['custom:role']) {
      const customRole = attributes['custom:role'].toLowerCase();
      if (customRole === 'admin' || customRole === 'teacher' || customRole === 'student') {
        return customRole as UserRole;
      }
    }

    // 2. Check Cognito User Pool Groups in ID Token claims
    const groups = session?.tokens?.idToken?.payload?.['cognito:groups'] as string[] | undefined;
    if (Array.isArray(groups)) {
      if (groups.includes('Admin') || groups.includes('admin')) return 'admin';
      if (groups.includes('Teacher') || groups.includes('teacher')) return 'teacher';
      if (groups.includes('Student') || groups.includes('student')) return 'student';
    }

    return 'student'; // Default fallback
  };

  // Initial session check
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      if (!awsConfig.isConfigured) {
        // Mock mode: restore saved mock user or default to student
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(DEMO_USERS.student);
          }
        } else {
          setUser(DEMO_USERS.student);
        }
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        const role = resolveRoleFromCognito(attributes as Record<string, string | undefined>, session);

        setUser({
          userId: currentUser.userId,
          email: attributes.email || currentUser.username,
          name: attributes.name || attributes.email || 'Robotics Student',
          role,
          isMock: false,
        });
      } catch (err) {
        // No active Cognito session
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      if (!awsConfig.isConfigured) {
        // Mock login
        const role: UserRole = email.includes('admin') ? 'admin' : 'student';
        const mockUser: AuthUser = {
          userId: `usr_${Date.now()}`,
          email,
          name: email.split('@')[0].toUpperCase(),
          role,
          isMock: true,
        };
        setUser(mockUser);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
        return mockUser;
      }

      // AWS Cognito Login
      const signInResult = await amplifySignIn({ username: email, password });
      if (signInResult.isSignedIn) {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        const role = resolveRoleFromCognito(attributes as Record<string, string | undefined>, session);

        const authUser: AuthUser = {
          userId: currentUser.userId,
          email: attributes.email || email,
          name: attributes.name || email,
          role,
          isMock: false,
        };
        setUser(authUser);
        return authUser;
      } else {
        throw new Error('Additional sign-in challenge required.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      if (!awsConfig.isConfigured) {
        const mockUser: AuthUser = {
          userId: `usr_${Date.now()}`,
          email: data.email,
          name: data.name,
          role: data.role,
          isMock: true,
        };
        setUser(mockUser);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
        return { isSignUpComplete: true, userId: mockUser.userId };
      }

      // AWS Cognito Sign Up with custom:role & name attributes
      const result = await amplifySignUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            name: data.name,
            'custom:role': data.role,
          },
        },
      });

      return {
        isSignUpComplete: result.isSignUpComplete,
        userId: result.userId,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRegistration = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!awsConfig.isConfigured) {
        return true;
      }
      const result = await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return result.isSignUpComplete;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (awsConfig.isConfigured) {
        await amplifySignOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMockRole = (role: UserRole) => {
    const selected = role === 'admin' ? DEMO_USERS.admin : DEMO_USERS.student;
    setUser(selected);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selected));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isMockMode,
        role: user?.role || 'student',
        login,
        register,
        confirmRegistration,
        logout,
        switchMockRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

