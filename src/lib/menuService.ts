
import type { MenuItem } from '@/types';
import { getDb } from './db';

export async function getMenuItems(userId: string): Promise<MenuItem[]> {
  const db = await getDb();
  return db.all<MenuItem[]>('SELECT * FROM menu_items WHERE userId = ? ORDER BY category, name', userId);
}

export async function getMenuItemById(id: string, userId: string): Promise<MenuItem | undefined> {
  const db = await getDb();
  return db.get<MenuItem>('SELECT * FROM menu_items WHERE id = ? AND userId = ?', id, userId);
}

export async function addMenuItem(itemData: Omit<MenuItem, 'id' | 'userId'>, userId: string): Promise<MenuItem> {
  const db = await getDb();
  const newId = `MENU-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newItem: MenuItem = {
    ...itemData,
    id: newId,
    userId: userId,
  };

  await db.run(
    'INSERT INTO menu_items (id, userId, name, description, price, category, portion, imageUrl, dataAiHint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    newItem.id,
    newItem.userId,
    newItem.name,
    newItem.description,
    newItem.price,
    newItem.category,
    newItem.portion,
    newItem.imageUrl,
    newItem.dataAiHint
  );
  return newItem;
}

export async function updateMenuItem(id: string, updatedItemData: Partial<Omit<MenuItem, 'id' | 'userId'>>, userId: string): Promise<MenuItem | null> {
    const db = await getDb();
    const existingItem = await getMenuItemById(id, userId);
    if (!existingItem) return null;

    const itemToUpdate = { ...existingItem, ...updatedItemData };

    await db.run(
        'UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, portion = ?, imageUrl = ?, dataAiHint = ? WHERE id = ? AND userId = ?',
        itemToUpdate.name,
        itemToUpdate.description,
        itemToUpdate.price,
        itemToUpdate.category,
        itemToUpdate.portion,
        itemToUpdate.imageUrl,
        itemToUpdate.dataAiHint,
        id,
        userId
    );
    return itemToUpdate;
}


export async function deleteMenuItem(id: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.run('DELETE FROM menu_items WHERE id = ? AND userId = ?', id, userId);
  return result.changes !== undefined && result.changes > 0;
}


export async function replaceMenuItemsForUser(itemsData: Omit<MenuItem, 'id' | 'userId'>[], userId: string): Promise<MenuItem[]> {
  const db = await getDb();
  const newItemsForUser: MenuItem[] = itemsData.map((item, index) => ({
    ...item,
    id: `XLSX-${Date.now()}-${index}-${userId.substring(0,3)}`,
    userId: userId,
  }));

  try {
    await db.exec('BEGIN TRANSACTION');
    
    await db.run('DELETE FROM menu_items WHERE userId = ?', userId);
    
    const stmt = await db.prepare('INSERT INTO menu_items (id, userId, name, description, price, category, portion, imageUrl, dataAiHint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of newItemsForUser) {
        await stmt.run(item.id, item.userId, item.name, item.description, item.price, item.category, item.portion, item.imageUrl, item.dataAiHint);
    }
    await stmt.finalize();

    await db.exec('COMMIT');

    return newItemsForUser;

  } catch (error) {
    console.error("Transaction failed, rolling back:", error);
    await db.exec('ROLLBACK');
    throw new Error("Failed to replace menu items due to a database error.");
  }
}
