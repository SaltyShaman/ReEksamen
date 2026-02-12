import { Router } from "express";
import db from "../database/connection.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
    emitHallCreated,
    emitHallUpdated,
    emitHallDeleted
} from "../sockets/events/hallEvents.js";

const router = Router();

/**
 * GET all halls (admin)
 */
router.get("/", requireLogin, requireAdmin, async (req, res) => {
    try {
        const halls = await db.all(
            "SELECT id, name, total_seats, created_at FROM halls"
        );
        res.json({ halls });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch halls" });
    }
});

/**
 * GET hall by id (admin)
 */
router.get("/:id", requireLogin, requireAdmin, async (req, res) => {
    try {
        const hall = await db.get(
            "SELECT id, name, total_seats, created_at FROM halls WHERE id = ?",
            [req.params.id]
        );

        if (!hall) {
            return res.status(404).json({ error: "Hall not found" });
        }

        res.json({ hall });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch hall" });
    }
});

/**
 * CREATE hall (admin)
 */
router.post("/create", requireLogin, requireAdmin, async (req, res) => {
    try {
        const { name, totalSeats } = req.body;

        if (!name || !totalSeats || totalSeats <= 0) {
            return res.status(400).json({
                error: "Valid name and totalSeats are required"
            });
        }

        const existing = await db.get(
            "SELECT id FROM halls WHERE name = ?",
            [name]
        );

        if (existing) {
            return res.status(400).json({ error: "Hall name already exists" });
        }

        // Create hall
        const result = await db.run(
            "INSERT INTO halls (name, total_seats) VALUES (?, ?)",
            [name, totalSeats]
        );

        const hallId = result.lastID;

        // Generate seats (ONCE)
        for (let seatNumber = 1; seatNumber <= totalSeats; seatNumber++) {
            await db.run(
                "INSERT INTO seats (hall_id, seat_number) VALUES (?, ?)",
                [hallId, seatNumber]
            );
        }

        const hall = {
            id: hallId,
            name,
            total_seats: totalSeats
        };

        emitHallCreated(hall);

        res.status(201).json({
            message: "Hall created successfully",
            hall
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create hall" });
    }
});

/**
 * UPDATE hall name (admin)
 * total_seats intentionally NOT editable
 */
router.put("/:id", requireLogin, requireAdmin, async (req, res) => {
    const { name } = req.body;
    const hallId = req.params.id;

    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    try {
        const hall = await db.get(
            "SELECT * FROM halls WHERE id = ?",
            [hallId]
        );

        if (!hall) {
            return res.status(404).json({ error: "Hall not found" });
        }

        const futureShowtime = await db.get(
            "SELECT id FROM showtimes WHERE hall_id = ? AND show_datetime > datetime('now') LIMIT 1",
            [hallId]
        );

        if (futureShowtime) {
            return res.status(400).json({ 
                error: "Cannot delete hall: there are future scheduled showtimes" 
            });
        }

        await db.run(
            "UPDATE halls SET name = ? WHERE id = ?",
            [name, hallId]
        );

        const updatedHall = {
            ...hall,
            name
        };

        emitHallUpdated(updatedHall);

        res.json({ message: "Hall updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update hall" });
    }
});

/**
 * DELETE hall (admin)
 */
router.delete("/:id", requireLogin, requireAdmin, async (req, res) => {
    try {
        const hallId = req.params.id;

        const hall = await db.get(
            "SELECT id FROM halls WHERE id = ?",
            [hallId]
        );

        if (!hall) {
            return res.status(404).json({ error: "Hall not found" });
        }

    // Check for active showtimes (ongoing OR future)
    const activeShowtime = await db.get(`
        SELECT s.id
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.id
        WHERE s.hall_id = ?
        AND DATETIME(s.show_datetime, '+' || m.duration_minutes || ' minutes') > DATETIME('now')
        LIMIT 1
    `, [hallId]);

    if (activeShowtime) {
        return res.status(400).json({
            error: "Cannot delete hall: there are active or upcoming showtimes"
        });
}


        await db.run("DELETE FROM halls WHERE id = ?", [hallId]);

        emitHallDeleted(hallId);

        res.json({ message: "Hall deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete hall" });
    }
});

export default router;
