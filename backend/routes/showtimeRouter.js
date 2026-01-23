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





export default router;