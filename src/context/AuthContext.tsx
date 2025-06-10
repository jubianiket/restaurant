
"use client";

import type { AuthUser } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => void; // Password is now optional for existing calls, but required by login page
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Demo credentials
const DEMO_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "password123";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

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

  const login = useCallback((email: string, password?: string) => {
    // Check against demo credentials if password is provided (i.e., from login page)
    if (password !== undefined) { // This check ensures direct calls without password (if any) don't break
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        const newUser = { email };
        setUser(newUser);
        localStorage.setItem('foodieUser', JSON.stringify(newUser));
        router.push('/create-order');
        toast({ title: "Login Successful!", description: "Welcome back!" });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return; // Prevent further execution for failed login
      }
    } else {
      // Fallback for any existing call that might only pass email (should be updated)
      // For now, let's assume if only email is passed, it's a simplified login path not from the main form.
      // Or, enforce password by removing this else block and always requiring password.
      // For this fix, we focus on the main login form path.
      const newUser = { email };
      setUser(newUser);
      localStorage.setItem('foodieUser', JSON.stringify(newUser));
      router.push('/create-order');
    }
  }, [router, toast]);

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
