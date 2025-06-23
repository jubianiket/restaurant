
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Settings {
    tableCount: number;
}

interface SettingsContextType {
    settings: Settings;
    isLoading: boolean;
    setTableCount: (count: number) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

const DEFAULT_TABLE_COUNT = 12;

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({ tableCount: DEFAULT_TABLE_COUNT });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const getSettingsKey = useCallback(() => {
    if (!user?.email) return null;
    return `foodieSettings_${user.email}`;
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    const settingsKey = getSettingsKey();
    if (settingsKey) {
      try {
        const storedSettings = localStorage.getItem(settingsKey);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        } else {
          setSettings({ tableCount: DEFAULT_TABLE_COUNT });
        }
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        setSettings({ tableCount: DEFAULT_TABLE_COUNT });
      }
    } else {
        // Not logged in, use default
        setSettings({ tableCount: DEFAULT_TABLE_COUNT });
    }
    setIsLoading(false);
  }, [getSettingsKey]);


  const setTableCount = useCallback((count: number) => {
    const settingsKey = getSettingsKey();
    if (settingsKey) {
        const newSettings = { ...settings, tableCount: count };
        setSettings(newSettings);
        localStorage.setItem(settingsKey, JSON.stringify(newSettings));
    }
  }, [settings, getSettingsKey]);

  const value = { settings, isLoading, setTableCount };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
