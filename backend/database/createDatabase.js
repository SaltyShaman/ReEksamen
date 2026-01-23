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

// SEED MOVIES
const moviesSeed = [
    { title: "The Shawshank Redemption", description: "Two imprisoned men bond over years, finding hope.", duration: 142, release_date: "1994-09-23" },
    { title: "The Godfather", description: "The aging patriarch of an organized crime dynasty transfers control to his son.", duration: 175, release_date: "1972-03-24" },
    { title: "The Dark Knight", description: "Batman faces the Joker in Gotham City.", duration: 152, release_date: "2008-07-18" },
    { title: "Pulp Fiction", description: "The lives of two mob hitmen intertwine in a series of stories.", duration: 154, release_date: "1994-10-14" },
    { title: "Forrest Gump", description: "The life journey of a slow-witted but kind-hearted man.", duration: 142, release_date: "1994-07-06" },
    { title: "Inception", description: "A thief steals corporate secrets through dream-sharing technology.", duration: 148, release_date: "2010-07-16" },
    { title: "Fight Club", description: "An insomniac and a soap maker form an underground fight club.", duration: 139, release_date: "1999-10-15" },
    { title: "The Matrix", description: "A hacker discovers reality is a simulation.", duration: 136, release_date: "1999-03-31" },
    { title: "Interstellar", description: "A team travels through a wormhole in search of a new home for humanity.", duration: 169, release_date: "2014-11-07" },
    { title: "The Lord of the Rings: The Fellowship of the Ring", description: "A hobbit sets out on a quest to destroy a powerful ring.", duration: 178, release_date: "2001-12-19" }
];

    for (const movie of moviesSeed) {
        await db.run(
            `INSERT INTO movies (title, description, duration_minutes, release_date)
            VALUES (?, ?, ?, ?)`,
            [movie.title, movie.description, movie.duration, movie.release_date]
        );
    }

    // SEED SHOWTIMES (end of February)
    const showtimesSeed = [
    {
        movie_id: 1, // The Shawshank Redemption
        hall_id: 1,  // Big Hall
        show_datetime: "2026-02-24T18:00"
    },
    {
        movie_id: 3, // The Dark Knight
        hall_id: 1,
        show_datetime: "2026-02-25T20:30"
    },
    {
        movie_id: 6, // Inception
        hall_id: 2,  // Small Hall
        show_datetime: "2026-02-26T19:00"
    },
    {
        movie_id: 8, // The Matrix
        hall_id: 1,
        show_datetime: "2026-02-27T21:00"
    },
    {
        movie_id: 9, // Interstellar
        hall_id: 2,
        show_datetime: "2026-02-28T17:30"
    }
    ];

    for (const showtime of showtimesSeed) {
        await db.run(
            `INSERT INTO showtimes (movie_id, hall_id, show_datetime)
            VALUES (?, ?, ?)`,
            [showtime.movie_id, showtime.hall_id, showtime.show_datetime]
        );
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
