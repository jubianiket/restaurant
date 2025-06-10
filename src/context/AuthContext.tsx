
"use client";

import type { AuthUser } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string) => void; // Simplified login
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('foodieUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('foodieUser');
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string) => {
    const newUser = { email };
    setUser(newUser);
    localStorage.setItem('foodieUser', JSON.stringify(newUser));
    router.push('/create-order');
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('foodieUser');
    router.push('/'); // Redirect to login page
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
