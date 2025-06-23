
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_TABLE_COUNT = 12;
const DEFAULT_BUILDINGS = ["Tower A", "Tower B", "Tower C", "Green View Apartments", "Sunset Villas"];
const DEFAULT_FLATS = Array.from({ length: 20 }, (_, i) => (101 + i).toString());


interface Settings {
    tableCount: number;
    buildings: string[];
    flats: string[];
}

interface SettingsContextType {
    settings: Settings;
    isLoading: boolean;
    setTableCount: (count: number) => void;
    addBuilding: (building: string) => void;
    removeBuilding: (building: string) => void;
    addFlat: (flat: string) => void;
    removeFlat: (flat: string) => void;
    setBuildingsAndFlats: (buildings: string[], flats: string[]) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

const defaultSettings: Settings = {
    tableCount: DEFAULT_TABLE_COUNT,
    buildings: DEFAULT_BUILDINGS,
    flats: DEFAULT_FLATS,
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
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
        const storedSettingsJSON = localStorage.getItem(settingsKey);
        if (storedSettingsJSON) {
          const storedSettings = JSON.parse(storedSettingsJSON);
          // Merge stored settings with defaults to handle missing keys
          setSettings({
              tableCount: storedSettings.tableCount || DEFAULT_TABLE_COUNT,
              buildings: Array.isArray(storedSettings.buildings) && storedSettings.buildings.length > 0 ? storedSettings.buildings : DEFAULT_BUILDINGS,
              flats: Array.isArray(storedSettings.flats) && storedSettings.flats.length > 0 ? storedSettings.flats : DEFAULT_FLATS,
          });
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        setSettings(defaultSettings);
      }
    } else {
        setSettings(defaultSettings);
    }
    setIsLoading(false);
  }, [getSettingsKey]);


  const updateSettings = useCallback((newSettings: Settings) => {
    const settingsKey = getSettingsKey();
    if (settingsKey) {
        setSettings(newSettings);
        localStorage.setItem(settingsKey, JSON.stringify(newSettings));
    }
  }, [getSettingsKey]);

  const setTableCount = useCallback((count: number) => {
    updateSettings({ ...settings, tableCount: count });
  }, [settings, updateSettings]);

  const addBuilding = useCallback((building: string) => {
    if (building && !settings.buildings.includes(building)) {
        const newSettings = { ...settings, buildings: [...settings.buildings, building].sort((a, b) => a.localeCompare(b)) };
        updateSettings(newSettings);
    }
  }, [settings, updateSettings]);

  const removeBuilding = useCallback((building: string) => {
    const newSettings = { ...settings, buildings: settings.buildings.filter(b => b !== building) };
    updateSettings(newSettings);
  }, [settings, updateSettings]);

  const addFlat = useCallback((flat: string) => {
    if (flat && !settings.flats.includes(flat)) {
        const newSettings = { ...settings, flats: [...settings.flats, flat].sort((a,b) => a.localeCompare(b, undefined, {numeric: true})) };
        updateSettings(newSettings);
    }
  }, [settings, updateSettings]);

  const removeFlat = useCallback((flat: string) => {
    const newSettings = { ...settings, flats: settings.flats.filter(f => f !== flat) };
    updateSettings(newSettings);
  }, [settings, updateSettings]);
  
  const setBuildingsAndFlats = useCallback((buildings: string[], flats: string[]) => {
    updateSettings({ 
        ...settings, 
        buildings: [...new Set(buildings)].sort((a, b) => a.localeCompare(b)),
        flats: [...new Set(flats)].sort((a,b) => a.localeCompare(b, undefined, {numeric: true})),
    });
  }, [settings, updateSettings]);


  const value = { settings, isLoading, setTableCount, addBuilding, removeBuilding, addFlat, removeFlat, setBuildingsAndFlats };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
