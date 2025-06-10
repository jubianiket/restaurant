
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

const DEMO_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "password123";
const USERS_STORAGE_KEY = 'foodieRegisteredUsers';
const LOGGED_IN_USER_KEY = 'foodieUser';

// Basic pseudo-hashing for demonstration. DO NOT USE IN PRODUCTION.
const pseudoHashPassword = (password: string): string => {
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

  const login = useCallback((emailInput: string, passwordInput?: string) => {
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
    const passwordHash = pseudoHashPassword(password);

    let foundUser: AuthUser | null = null;
    let userName: string | undefined = undefined;

    // Check demo admin credentials
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      foundUser = { email, name: "Admin User" };
      userName = "Admin User";
    } else {
      // Check localStorage for registered users
      try {
        const existingUsersString = localStorage.getItem(USERS_STORAGE_KEY);
        const existingUsers: StoredUser[] = existingUsersString ? JSON.parse(existingUsersString) : [];
        
        const registeredUser = existingUsers.find(u => u.email === email);

        if (registeredUser && registeredUser.passwordHash === passwordHash) {
          foundUser = { email: registeredUser.email, name: registeredUser.name };
          userName = registeredUser.name;
        }
      } catch (error) {
        console.error("Error reading registered users from localStorage:", error);
        toast({
          title: "Login Error",
          description: "An error occurred while trying to log in. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    if (foundUser) {
      const userToStore: AuthUser = { email: foundUser.email, name: userName };
      setUser(userToStore);
      localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(userToStore));
      router.push('/create-order');
      toast({ title: "Login Successful!", description: `Welcome back, ${userName || 'user'}!` });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
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
