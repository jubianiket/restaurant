
"use client";

import type { AuthUser, StoredUser } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const LOGGED_IN_USER_KEY = 'foodieUser';

// Basic pseudo-hashing for demonstration. DO NOT USE IN PRODUCTION.
export const pseudoHashPassword = (password: string): string => {
  return `hashed_${password}_${password.split('').reverse().join('')}`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(LOGGED_IN_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(LOGGED_IN_USER_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (emailInput: string, passwordInput?: string) => {
    if (!passwordInput) {
      toast({
        title: "Login Failed",
        description: "Password is required.",
        variant: "destructive",
      });
      return;
    }

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userToStore: AuthUser = data;
        setUser(userToStore);
        localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(userToStore));
        router.push('/create-order');
        toast({ title: "Login Successful!", description: `Welcome back, ${userToStore.name || 'user'}!` });
      } else {
        toast({
            title: "Login Failed",
            description: data.message || "Invalid email or password.",
            variant: "destructive",
        });
      }
    } catch (error) {
        console.error("Login fetch error:", error);
        toast({
            title: "Login Error",
            description: "Could not connect to the server. Please try again later.",
            variant: "destructive",
        });
    }
  }, [router, toast]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LOGGED_IN_USER_KEY);
    router.push('/'); 
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
