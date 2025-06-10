
import type { MenuItem } from '@/types';
import { mockMenuItems as initialMockMenuItems } from '@/lib/mockData';

let liveMenuItems: MenuItem[] = JSON.parse(JSON.stringify(initialMockMenuItems));

export function getMenuItems(userId: string): MenuItem[] {
  return JSON.parse(JSON.stringify(liveMenuItems.filter(item => item.userId === userId)));
}

export function getMenuItemById(id: string, userId: string): MenuItem | undefined {
  return liveMenuItems.find(item => item.id === id && item.userId === userId);
}

export function addMenuItem(itemData: Omit<MenuItem, 'id' | 'userId'>, userId: string): MenuItem {
  const newItem: MenuItem = {
    ...itemData,
    id: `MENU-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId,
  };
  liveMenuItems.push(newItem);
  return { ...newItem };
}

export function updateMenuItem(id: string, updatedItemData: Partial<Omit<MenuItem, 'id' | 'userId'>>, userId: string): MenuItem | null {
  const itemIndex = liveMenuItems.findIndex(item => item.id === id && item.userId === userId);
  if (itemIndex === -1) return null;

  liveMenuItems[itemIndex] = {
    ...liveMenuItems[itemIndex],
    ...updatedItemData,
    userId: userId, // Ensure userId remains consistent
  };
  return { ...liveMenuItems[itemIndex] };
}

export function deleteMenuItem(id: string, userId: string): boolean {
  const initialLength = liveMenuItems.length;
  liveMenuItems = liveMenuItems.filter(item => !(item.id === id && item.userId === userId));
  return liveMenuItems.length < initialLength;
}

// Replaces all menu items for a specific user
export function replaceMenuItemsForUser(itemsData: Omit<MenuItem, 'id' | 'userId'>[], userId: string): MenuItem[] {
  // Remove all existing items for this user
  liveMenuItems = liveMenuItems.filter(item => item.userId !== userId);

  // Add new items for this user
  const newItemsForUser: MenuItem[] = itemsData.map((item, index) => ({
    ...item,
    id: `XLSX-${Date.now()}-${index}-${userId.substring(0,3)}`, // Ensure unique ID
    userId: userId,
  }));

  liveMenuItems.push(...newItemsForUser);
  return JSON.parse(JSON.stringify(newItemsForUser));
}
