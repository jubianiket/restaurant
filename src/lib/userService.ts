
import { getDb } from './db';
import type { StoredUser } from '@/types';

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const db = await getDb();
  return db.get<StoredUser>('SELECT * FROM users WHERE email = ?', email);
}

export async function createUser(userData: Omit<StoredUser, 'id'>): Promise<StoredUser | undefined> {
  const db = await getDb();
  const { name, email, passwordHash } = userData;

  const result = await db.run(
    'INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)',
    name,
    email,
    passwordHash
  );

  if (result.lastID) {
    return db.get<StoredUser>('SELECT * FROM users WHERE id = ?', result.lastID);
  }
}
