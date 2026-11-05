import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signIn as amplifySignIn, 
  signUp as amplifySignUp, 
  confirmSignUp as amplifyConfirmSignUp, 
  resendSignUpCode as amplifyResendSignUpCode,
  signOut as amplifySignOut, 
  getCurrentUser, 
  fetchUserAttributes, 
  fetchAuthSession 
} from 'aws-amplify/auth';
import { awsConfig } from '../aws-exports';
import { AuthUser, UserRole, SignUpData } from '../types/auth';
import { userService } from '../services/userService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  role: UserRole;
  isAdmin: boolean;
  adminViewMode: 'admin' | 'student';
  toggleAdminViewMode: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: SignUpData) => Promise<{ isSignUpComplete: boolean; userId?: string }>;
  confirmRegistration: (email: string, code: string) => Promise<boolean>;
  resendCode: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  enrollInPathway: (pathwayId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'robolms_mock_user';
const ADMIN_EMAIL = awsConfig.adminEmail.toLowerCase();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'student'>('admin');
  const isMockMode = !awsConfig.isConfigured;

  // Resolve user role: Super Admin check -> User Registry check -> Cognito attributes
  const resolveRole = (email: string, attributes?: Record<string, string | undefined>, session?: any): UserRole => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === ADMIN_EMAIL) {
      return 'admin';
    }

    // Check persistent user registry (where admin manages approvals)
    const registered = userService.getUserByEmail(cleanEmail);
    if (registered) {
      return registered.role;
    }

    // Check Cognito custom attributes or groups
    if (attributes?.['custom:role']) {
      const customRole = attributes['custom:role'].toLowerCase();
      if (customRole === 'admin' || customRole === 'teacher' || customRole === 'student') {
        return customRole as UserRole;
      }
    }

    const groups = session?.tokens?.idToken?.payload?.['cognito:groups'] as string[] | undefined;
    if (Array.isArray(groups)) {
      if (groups.includes('Admin') || groups.includes('admin')) return 'admin';
      if (groups.includes('Teacher') || groups.includes('teacher')) return 'teacher';
      if (groups.includes('Student') || groups.includes('student')) return 'student';
    }

    // All self-registered users default to guest preview pending approval
    return 'guest';
  };

  const loadUserData = async () => {
    setIsLoading(true);
    if (!awsConfig.isConfigured) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const role = resolveRole(parsed.email);
          setUser({ ...parsed, role });
        } catch {
          setUser(null);
        }
      } else {
        // Default to admin for convenient local testing if configured
        const adminRec = userService.getUserByEmail(ADMIN_EMAIL);
        if (adminRec) {
          setUser({
            userId: adminRec.userId,
            email: adminRec.email,
            name: adminRec.name,
            role: 'admin',
            status: 'approved',
            enrolledProjectIds: adminRec.enrolledProjectIds,
            isMock: true,
          });
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();
      const userEmail = (attributes.email || currentUser.username || '').toLowerCase();
      const role = resolveRole(userEmail, attributes as Record<string, string | undefined>, session);

      // Keep registry synchronized
      const regRecord = userService.registerOrUpdateUser({
        email: userEmail,
        name: attributes.name || attributes.email || 'Robotics Member',
        userId: currentUser.userId,
      });

      setUser({
        userId: currentUser.userId,
        email: userEmail,
        name: attributes.name || regRecord.name || userEmail,
        role: regRecord.role || role,
        status: regRecord.status,
        enrolledProjectIds: regRecord.enrolledProjectIds,
        enrolledPathways: regRecord.enrolledPathways || [],
        isMock: false,
      });
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      if (!awsConfig.isConfigured) {
        const isSuperAdmin = cleanEmail === ADMIN_EMAIL;
        const regRecord = userService.registerOrUpdateUser({
          email: cleanEmail,
          name: cleanEmail.split('@')[0].toUpperCase(),
        });

        const authUser: AuthUser = {
          userId: regRecord.userId,
          email: cleanEmail,
          name: regRecord.name,
          role: isSuperAdmin ? 'admin' : regRecord.role,
          status: regRecord.status,
          enrolledProjectIds: regRecord.enrolledProjectIds,
          enrolledPathways: regRecord.enrolledPathways || [],
          isMock: true,
        };
        setUser(authUser);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
        return authUser;
      }

      const signInResult = await amplifySignIn({ username: cleanEmail, password });
      if (signInResult.isSignedIn) {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        const role = resolveRole(cleanEmail, attributes as Record<string, string | undefined>, session);

        // Record in registry
        const regRecord = userService.registerOrUpdateUser({
          email: cleanEmail,
          name: attributes.name || cleanEmail,
          userId: currentUser.userId,
        });

        const authUser: AuthUser = {
          userId: currentUser.userId,
          email: attributes.email || cleanEmail,
          name: attributes.name || regRecord.name || cleanEmail,
          role: regRecord.role || role,
          status: regRecord.status,
          enrolledProjectIds: regRecord.enrolledProjectIds,
          enrolledPathways: regRecord.enrolledPathways || [],
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
    const cleanEmail = data.email.toLowerCase().trim();
    const isSuperAdmin = cleanEmail === ADMIN_EMAIL;
    const assignedRole: UserRole = isSuperAdmin ? 'admin' : 'guest';

    try {
      if (!awsConfig.isConfigured) {
        const regRecord = userService.registerOrUpdateUser({
          email: cleanEmail,
          name: data.name,
        });

        const mockUser: AuthUser = {
          userId: regRecord.userId,
          email: cleanEmail,
          name: data.name,
          role: assignedRole,
          status: isSuperAdmin ? 'approved' : 'pending',
          enrolledProjectIds: regRecord.enrolledProjectIds,
          isMock: true,
        };
        setUser(mockUser);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
        return { isSignUpComplete: true, userId: mockUser.userId };
      }

      const result = await amplifySignUp({
        username: cleanEmail,
        password: data.password,
        options: {
          userAttributes: {
            email: cleanEmail,
            name: data.name,
          },
        },
      });

      // Record new registration in our local registry with 'guest' preview role
      userService.registerOrUpdateUser({
        email: cleanEmail,
        name: data.name,
        userId: result.userId,
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
        username: email.toLowerCase().trim(),
        confirmationCode: code,
      });
      return result.isSignUpComplete;
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async (email: string): Promise<void> => {
    if (awsConfig.isConfigured) {
      await amplifyResendSignUpCode({ username: email.toLowerCase().trim() });
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

  const toggleAdminViewMode = () => {
    setAdminViewMode((prev) => (prev === 'admin' ? 'student' : 'admin'));
  };

  const refreshUser = () => {
    if (user) {
      const regRecord = userService.getUserByEmail(user.email);
      if (regRecord) {
        setUser((prev) => prev ? {
          ...prev,
          role: regRecord.role,
          status: regRecord.status,
          enrolledProjectIds: regRecord.enrolledProjectIds,
          enrolledPathways: regRecord.enrolledPathways || [],
        } : null);
      }
    }
  };

  const enrollInPathway = (pathwayId: string) => {
    if (!user) return;
    const current = (user.enrolledPathways || []) as any[];
    if (!current.includes(pathwayId)) {
      const updated = [...current, pathwayId];
      userService.updateUserPathways(user.email, updated);
      setUser((prev) => prev ? {
        ...prev,
        enrolledPathways: updated,
      } : null);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email.toLowerCase() === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isMockMode,
        role: user?.role || 'guest',
        isAdmin,
        adminViewMode,
        toggleAdminViewMode,
        login,
        register,
        confirmRegistration,
        resendCode,
        logout,
        refreshUser,
        enrollInPathway,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const DEFAULT_AUTH_CONTEXT: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isMockMode: false,
  role: 'guest',
  isAdmin: false,
  adminViewMode: 'student',
  toggleAdminViewMode: () => {},
  login: async () => ({ userId: 'guest', email: '', name: 'Guest', role: 'guest', isMock: false }),
  register: async () => ({ isSignUpComplete: true }),
  confirmRegistration: async () => true,
  resendCode: async () => {},
  logout: async () => {},
  refreshUser: () => {},
  enrollInPathway: () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || DEFAULT_AUTH_CONTEXT;
};
