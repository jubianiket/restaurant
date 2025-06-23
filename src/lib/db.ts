
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// Let's declare a global variable to hold the connection.
// This is to prevent re-opening the connection on every hot-reload in development.
declare global {
  var __db__: Awaited<ReturnType<typeof open>> | undefined;
}

const initializeDb = async () => {
  // open the database file
  const db = await open({
    // Place DB in project root
    filename: path.join(process.cwd(), './foodie.db'),
    driver: sqlite3.Database,
  });

  // Run a migration script to create your tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      portion TEXT,
      imageUrl TEXT,
      dataAiHint TEXT,
      FOREIGN KEY (userId) REFERENCES users (email) ON DELETE CASCADE
    );

    -- Future tables for orders can be added here
    -- CREATE TABLE IF NOT EXISTS orders (...);
    -- CREATE TABLE IF NOT EXISTS order_items (...);
  `);

  return db;
};

export async function getDb() {
  if (process.env.NODE_ENV === 'production') {
    return await initializeDb();
  } else {
    // In development, use a global variable so that the value
    // is preserved across module reloads caused by HMR.
    if (!global.__db__) {
      global.__db__ = initializeDb();
    }
    return global.__db__;
  }
}
