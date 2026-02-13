import { Router } from "express";
import db from "../database/connection.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { emitShowtimeCreated, emitShowtimeDeleted} from "../sockets/events/showtimeEvents.js";


/*

    IMPORTANT: diffrenciate showtime from reservations

    public routes:
            see all showtimes
            find showtime details by id

    admin routes:
        create showtime
        delete showtime
*/

const router = Router();

// see all showtimes (with movie + hall info)
router.get("/", async (req, res) => {
    try {
        const showtimes = await db.all(`
            SELECT
                s.id,
                s.show_datetime,
                s.created_at,
                m.id AS movie_id,
                m.title AS movie_title,
                h.id AS hall_id,
                h.name AS hall_name
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            JOIN halls h ON s.hall_id = h.id
            ORDER BY s.show_datetime ASC
        `);

        res.json({ showtimes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch showtimes" });
    }
});

// see showtimes by movie title (public)
router.get("/by-movie", async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ error: "Movie title is required" });
    }

    try {
        const showtimes = await db.all(`
            SELECT
                s.id AS showtime_id,
                s.show_datetime,
                m.id AS movie_id,
                m.title AS movie_title,
                h.id AS hall_id,
                h.name AS hall_name
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            JOIN halls h ON s.hall_id = h.id
            WHERE LOWER(m.title) LIKE LOWER(?)
            ORDER BY s.show_datetime ASC
        `, [`%${title}%`]);

        res.json({ showtimes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch showtimes" });
    }
});

router.post("/", requireLogin, requireAdmin, async (req, res) => {
    const { movie_id, hall_id, show_datetime } = req.body;

    // Basic validation
    if (!movie_id || !hall_id || !show_datetime) {
        return res.status(400).json({ error: "movie_id, hall_id, and show_datetime are required" });
    }

    // Validate show_datetime
    const date = new Date(show_datetime);
    if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid show_datetime format" });
    }

    // Optional: check that the string exactly matches YYYY-MM-DDTHH:MM:SS
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    if (!isoRegex.test(show_datetime)) {
        return res.status(400).json({ error: "show_datetime must be in format YYYY-MM-DDTHH:MM:SS" });
    }

    try {

        //fetch movie duration
        const movie = await db.get("SELECT duration_minutes FROM movies WHERE id = ?", [movie_id]);
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        const bufferMinutes = 30;
        const movieDuration = movie.duration_minutes + bufferMinutes;

        const conflicts = await db.all(`
            SELECT s.id, s.show_datetime, m.duration_minutes
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            WHERE s.hall_id = ?
              AND (
                    DATETIME(s.show_datetime) < DATETIME(?,'+${movieDuration} minutes')
                    AND DATETIME(s.show_datetime,'+' || m.duration_minutes || ' minutes') > DATETIME(?)
                  )
        `, [hall_id, show_datetime, show_datetime]);

        if (conflicts.length > 0) {
            return res.status(400).json({ error: "Cannot schedule: hall is busy during this time" });
        }

        // Insert showtime
        const result = await db.run(
            `INSERT INTO showtimes (movie_id, hall_id, show_datetime)
             VALUES (?, ?, ?)`,
            [movie_id, hall_id, show_datetime]
        );

        const showtimeId = result.lastID;

        // Fetch the created showtime with movie + hall info
        const showtime = await db.get(`
            SELECT 
                s.id AS showtime_id,
                s.show_datetime,
                m.id AS movie_id,
                m.title AS movie_title,
                h.id AS hall_id,
                h.name AS hall_name
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            JOIN halls h ON s.hall_id = h.id
            WHERE s.id = ?
        `, [showtimeId]);

        emitShowtimeCreated(showtime);

        res.status(201).json({ message: "Showtime created successfully", showtime });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create showtime" });
    }
});

//Delete showtime
router.delete("/:id", requireLogin, requireAdmin, async (req, res) => {
    const showtimeId = req.params.id;

    if (!showtimeId) {
        return res.status(400).json({ error: "Showtime ID is required" });
    }

    try {
        // Check if showtime exists
        const showtime = await db.get(
            "SELECT * FROM showtimes WHERE id = ?",
            [showtimeId]
        );

        if (!showtime) {
            return res.status(404).json({ error: "Showtime not found" });
        }

        // ✅ Correct reservation check (via reservation_groups)
        const existingReservations = await db.get(
            `
            SELECT rg.id
            FROM reservation_groups rg
            WHERE rg.showtime_id = ?
            LIMIT 1
            `,
            [showtimeId]
        );

        if (existingReservations) {
            return res.status(400).json({
                error: "Cannot delete showtime: there are existing reservations"
            });
        }

        // Delete showtime
        await db.run(
            "DELETE FROM showtimes WHERE id = ?",
            [showtimeId]
        );

        emitShowtimeDeleted(showtimeId);

        res.json({ message: "Showtime deleted", id: showtimeId });

    } catch (err) {
        console.error("DELETE SHOWTIME ERROR:", err);
        res.status(500).json({ error: "Failed to delete showtime" });
    }
});


// see showtimes by movie ID (public)
router.get("/movie/:movieId", async (req, res) => {
    const { movieId } = req.params;

    try {
        const showtimes = await db.all(`
            SELECT
                s.id,
                s.show_datetime,
                m.id AS movie_id,
                m.title AS movie_title,
                h.id AS hall_id,
                h.name AS hall_name
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            JOIN halls h ON s.hall_id = h.id
            WHERE s.movie_id = ?
            ORDER BY s.show_datetime ASC
        `, [movieId]);

        res.json({ showtimes });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch showtimes" });
    }
});


// Get showtime by ID (for admin delete page)
router.get("/:id", requireLogin, requireAdmin, async (req, res) => {
    const { id } = req.params;

    const showtime = await db.get(`
        SELECT 
            s.id,
            s.show_datetime,
            m.title AS movie_title,
            h.name AS hall_name
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.id
        JOIN halls h ON s.hall_id = h.id
        WHERE s.id = ?
    `, [id]);

    if (!showtime) {
        return res.status(404).json({ error: "Showtime not found" });
    }

    res.json({ showtime });
});


export default router;