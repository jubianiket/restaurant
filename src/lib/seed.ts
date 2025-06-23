
import { getDb } from './db';
import { mockMenuItems, mockUsers } from './mockData';

async function seed() {
  console.log('Seeding database...');
  try {
    const db = await getDb();
    await db.exec('BEGIN TRANSACTION');

    // Seed users
    console.log('Seeding users...');
    const userStmt = await db.prepare('INSERT OR IGNORE INTO users (name, email, passwordHash) VALUES (?, ?, ?)');
    for (const user of mockUsers) {
      await userStmt.run(user.name, user.email, user.passwordHash);
    }
    await userStmt.finalize();
    console.log(`${mockUsers.length} users seeded.`);

    // Seed menu items
    console.log('Seeding menu items...');
    const itemStmt = await db.prepare(
      'INSERT OR IGNORE INTO menu_items (id, userId, name, description, price, category, portion, imageUrl, dataAiHint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const item of mockMenuItems) {
        if(item.userId) {
            await itemStmt.run(
                item.id,
                item.userId,
                item.name,
                item.description,
                item.price,
                item.category,
                item.portion,
                item.imageUrl,
                item.dataAiHint
            );
        }
    }
    await itemStmt.finalize();
    console.log(`${mockMenuItems.length} menu items seeded.`);

    await db.exec('COMMIT');
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    const db = await getDb();
    await db.exec('ROLLBACK');
  }
}

seed().catch(err => {
    console.error("Seeding script failed:", err);
    process.exit(1);
});
