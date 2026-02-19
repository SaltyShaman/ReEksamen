import { Router } from "express";
import db from "../database/connection.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
    emitMovieCreated,
    emitMovieDeleted
} from "../sockets/events/movieEvents.js";
import { title } from "process";

const router = Router();

/*
    Movie endpoint logic:
        public routes:
                see all movies
                find movie by name
        
        admin routes:
                create movie
                delete movie

*/

//see all movies
router.get("/", async (req, res) => {

    try {
        const movies = await db.all("SELECT id, title, description, duration_minutes, release_date, created_at FROM movies");
        res.json({movies});
    } catch (err) {
        console.error(err);
        res.status(500).json({error : "Failed to fetch movies"});
    }
});


//see movie by name
router.get("/:movieId", async (req, res) => {
    const movieId = req.params.movieId;
    try {
        const movie = await db.get(
            "SELECT id, title, description, duration_minutes, release_date, created_at FROM movies WHERE id = ?",
            [movieId]
        );
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json({ movie });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch movie" });
    }
});

/**
 * CREATE movie (admin)
*/
router.post("/", requireLogin, requireAdmin, async (req, res) => {
    const { title, description, duration_minutes, release_date } = req.body;

    if (!title || !duration_minutes) {
        return res.status(400).json({ error: "Title and duration are required" });
    }

    try {
        const result = await db.run(
            `INSERT INTO movies (title, description, duration_minutes, release_date)
             VALUES (?, ?, ?, ?)`,
            [title, description || null, duration_minutes, release_date || null]
        );

        const newMovieId = result.lastID;

        // 🔥 Fetch FULL movie object
        const newMovie = await db.get(
            `SELECT id, title, description, duration_minutes, release_date, created_at
             FROM movies
             WHERE id = ?`,
            [newMovieId]
        );

        // 🔥 Emit FULL object (not just ID)
        emitMovieCreated(newMovie);

        res.status(201).json({
            id: newMovieId,
            message: "Movie created successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create movie" });
    }
});



// DELETE /movies/:id → delete a movie
router.delete("/:id", requireLogin, requireAdmin, async (req, res) => {
    const movieId = req.params.id;

    try {
        // see if movie exists
        const movie = await db.get("SELECT * FROM movies WHERE id = ?", [movieId]);
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        await db.run("DELETE FROM movies WHERE id = ?", [movieId]);

        emitMovieDeleted(movieId);

        res.json({ message: "Movie deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete movie" });
    }
});










export default router;
