import db from './connection.js';
import bcrypt from 'bcrypt';

const deleteMode = process.argv.includes('delete');

if (deleteMode) {
    await db.exec(`DROP TABLE IF EXISTS users;`);
}

// CREATE TABLE users
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TEXT NOT NULL);
`);

//to-do: seed with few diffrent users

//seeding v1: only users

if (deleteMode) {

    const now = new Date().toISOString();

    const hashedAdmin = await bcrypt.hash('admin123', 10);
    
    const hashedUserOne = await bcrypt.hash('user1', 10);
    const hashedUserTwo = await bcrypt.hash('user2', 10);
    const hashedUserThree = await bcrypt.hash('user3', 10);

    await db.run(
        `INSERT INTO users (username, password_hash, role, created_at)
         VALUES (?, ?, ?, ?)`,
        ["admin", hashedAdmin, "ADMIN", now]
    );

    await db.run(
        `INSERT INTO users (username, password_hash, role, created_at)
         VALUES (?, ?, ?, ?)`,
        ["user1", hashedUserOne, "USER", now]
    );

    await db.run(
        `INSERT INTO users (username, password_hash, role, created_at)
         VALUES (?, ?, ?, ?)`,
        ["user2", hashedUserTwo, "USER", now]
    );

    await db.run(
        `INSERT INTO users (username, password_hash, role, created_at)
         VALUES (?, ?, ?, ?)`,
        ["user3", hashedUserThree, "USER", now]
    );
}

process.exit(0);