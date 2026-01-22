import db from './connection.js';
import bcrypt from 'bcrypt';

const deleteMode = process.argv.includes('delete');

if (deleteMode) {
    // Drop tables in reverse order of dependencies
    await db.exec(`DROP TABLE IF EXISTS reservations;`);
    await db.exec(`DROP TABLE IF EXISTS showtimes;`);
    await db.exec(`DROP TABLE IF EXISTS movies;`);
    await db.exec(`DROP TABLE IF EXISTS seats;`);
    await db.exec(`DROP TABLE IF EXISTS halls;`);
    await db.exec(`DROP TABLE IF EXISTS users;`);
}

// CREATE TABLE users
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// CREATE TABLE halls
await db.exec(`
CREATE TABLE IF NOT EXISTS halls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    total_seats INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// CREATE TABLE seats
await db.exec(`
CREATE TABLE IF NOT EXISTS seats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hall_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    seat_number INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(hall_id, seat_number),
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);
`);

// CREATE TABLE movies
await db.exec(`
CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    release_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// CREATE TABLE showtimes
await db.exec(`
CREATE TABLE IF NOT EXISTS showtimes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    hall_id INTEGER NOT NULL,
    show_datetime TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);
`);

// CREATE TABLE reservations
await db.exec(`
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    showtime_id INTEGER NOT NULL,
    seat_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(showtime_id, seat_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
);
`);

// SEEDING
if (deleteMode) {
    const now = new Date().toISOString();

    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedUserOne = await bcrypt.hash('user1', 10);
    const hashedUserTwo = await bcrypt.hash('user2', 10);
    const hashedUserThree = await bcrypt.hash('user3', 10);

    const halls = [
    { name: "Big Hall", totalSeats: 200 },
    { name: "Small Hall", totalSeats: 75 }
    ];

for (const hall of halls) {

    const result = await db.run(
        `INSERT INTO halls (name, total_seats)
         VALUES (?, ?)`,
        [hall.name, hall.totalSeats]
    );

    const hallId = result.lastID;

    for (let seatNumber = 1; seatNumber <= hall.totalSeats; seatNumber++) {
        await db.run(
            `INSERT INTO seats (hall_id, seat_number)
             VALUES (?, ?)`,
            [hallId, seatNumber]
        );
    }
}


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
