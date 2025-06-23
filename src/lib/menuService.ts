
import type { MenuItem } from '@/types';
import { mockMenuItems as initialMockMenuItems } from '@/lib/mockData';

// HMR-safe in-memory store for development
declare global {
  var __menuItemsStore__: MenuItem[] | undefined;
}

const initializeStore = (): MenuItem[] => {
  return JSON.parse(JSON.stringify(initialMockMenuItems));
};

// Use a singleton pattern that is safe for HMR in development
const getStore = (): MenuItem[] => {
  if (process.env.NODE_ENV === 'production') {
    if (!global.__menuItemsStore__) {
      global.__menuItemsStore__ = initializeStore();
    }
    return global.__menuItemsStore__;
  } else {
    if (!global.__menuItemsStore__) {
      global.__menuItemsStore__ = initializeStore();
    }
    return global.__menuItemsStore__;
  }
};

const setStore = (newStore: MenuItem[]): void => {
    global.__menuItemsStore__ = newStore;
}

export function getMenuItems(userId: string): MenuItem[] {
  const store = getStore();
  // Return a deep copy to prevent direct mutation of the store from outside
  return JSON.parse(JSON.stringify(store.filter(item => item.userId === userId)));
}

export function getMenuItemById(id: string, userId: string): MenuItem | undefined {
  const store = getStore();
  const item = store.find(item => item.id === id && item.userId === userId);
  return item ? { ...item } : undefined;
}

export function addMenuItem(itemData: Omit<MenuItem, 'id' | 'userId'>, userId: string): MenuItem {
  const store = getStore();
  const newItem: MenuItem = {
    ...itemData,
    id: `MENU-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId,
  };
  store.push(newItem); // push modifies the array in place
  return { ...newItem };
}

export function updateMenuItem(id: string, updatedItemData: Partial<Omit<MenuItem, 'id' | 'userId'>>, userId: string): MenuItem | null {
  const store = getStore();
  const itemIndex = store.findIndex(item => item.id === id && item.userId === userId);
  if (itemIndex === -1) return null;

  // Modify in place
  store[itemIndex] = {
    ...store[itemIndex],
    ...updatedItemData,
    userId: userId,
  };
  return { ...store[itemIndex] };
}

export function deleteMenuItem(id: string, userId: string): boolean {
  const store = getStore();
  const initialLength = store.length;
  const newStore = store.filter(item => !(item.id === id && item.userId === userId));
  
  if (newStore.length < initialLength) {
      setStore(newStore);
      return true;
  }
  return false;
}

// Replaces all menu items for a specific user
export function replaceMenuItemsForUser(itemsData: Omit<MenuItem, 'id' | 'userId'>[], userId: string): MenuItem[] {
  const store = getStore();
  
  // Remove all existing items for this user
  const otherUsersItems = store.filter(item => item.userId !== userId);

  // Add new items for this user
  const newItemsForUser: MenuItem[] = itemsData.map((item, index) => ({
    ...item,
    id: `XLSX-${Date.now()}-${index}-${userId.substring(0,3)}`, // Ensure unique ID
    userId: userId,
  }));
  
  setStore([...otherUsersItems, ...newItemsForUser]);

  return JSON.parse(JSON.stringify(newItemsForUser));
}
