
import type { MenuItem } from '@/types';
import { mockMenuItems as initialMockMenuItems } from '@/lib/mockData';

// Deep copy to avoid modifying the original mockData array directly by reference
let liveMenuItems: MenuItem[] = JSON.parse(JSON.stringify(initialMockMenuItems));

export function getMenuItems(): MenuItem[] {
  return JSON.parse(JSON.stringify(liveMenuItems)); // Return a copy
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return liveMenuItems.find(item => item.id === id);
}

export function addMenuItem(itemData: Omit<MenuItem, 'id'>): MenuItem {
  const newItem: MenuItem = { 
    ...itemData, 
    id: `MENU-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` 
  };
  liveMenuItems.push(newItem);
  return { ...newItem }; // Return a copy
}

export function updateMenuItem(id: string, updatedItemData: Partial<Omit<MenuItem, 'id'>>): MenuItem | null {
  const itemIndex = liveMenuItems.findIndex(item => item.id === id);
  if (itemIndex === -1) return null;
  
  liveMenuItems[itemIndex] = { 
    ...liveMenuItems[itemIndex], 
    ...updatedItemData 
  };
  return { ...liveMenuItems[itemIndex] }; // Return a copy
}

export function deleteMenuItem(id: string): boolean {
  const initialLength = liveMenuItems.length;
  liveMenuItems = liveMenuItems.filter(item => item.id !== id);
  return liveMenuItems.length < initialLength;
}

export function replaceMenuItems(items: MenuItem[]): void {
  liveMenuItems = JSON.parse(JSON.stringify(items)); // Replace with a copy
}
