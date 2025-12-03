'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { account } from '@/lib/appwrite';
import { USER_ROLES } from '@/lib/constants';
import type { AppwriteUser, UserRole, AuthContextType } from '@/types';
import { Models } from 'appwrite';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state from user
  const role: UserRole | null = user?.labels?.includes(USER_ROLES.ADMIN)
    ? USER_ROLES.ADMIN
    : user?.labels?.includes(USER_ROLES.UPT_USER)
    ? USER_ROLES.UPT_USER
    : null;

  const uptName: string | null = user?.prefs?.upt_name || null;
  const isAuthenticated = !!user;

  /**
   * Fetch current user session
   */
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await account.get<Models.User<Models.Preferences>>();
      
      // Transform to AppwriteUser with safe type casting
      const appwriteUser: AppwriteUser = {
        $id: currentUser.$id,
        $createdAt: currentUser.$createdAt,
        $updatedAt: currentUser.$updatedAt,
        email: currentUser.email,
        name: currentUser.name,
        emailVerification: currentUser.emailVerification,
        labels: currentUser.labels,
        prefs: currentUser.prefs as unknown as { upt_name?: string },
      };
      
      setUser(appwriteUser);
    } catch {
      // User not logged in
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      // Create email session
      await account.createEmailPasswordSession(email, password);
      
      // Fetch user data after successful login
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const value: AuthContextType = {
    user,
    role,
    uptName,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
