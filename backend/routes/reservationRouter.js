import { Router } from "express";
import db from "../database/connection.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
    emitReservationCreated,
    emitReservationUpdated,
    emitReservationDeleted
} from "../sockets/events/reservationEvents.js";

/*
    Reservation endpoint logic:

        user routes:
            create reservation (multiple seats, same showtime)
            see own reservations (active + past)
            update own reservation
            cancel own reservation

        admin routes:
            see active reservations
            delete reservation
*/

const router = Router();


//create
router.post("/", requireLogin, async (req, res) => {
    const userId = req.user.id;
    const { showtimeId, seatIds } = req.body;

    if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ error: "Invalid reservation data" });
    }

    try {
        await db.exec("BEGIN");

        // create reservation group
        const group = await db.run(
            `INSERT INTO reservation_groups (user_id, showtime_id)
             VALUES (?, ?)`,
            [userId, showtimeId]
        );

        // reserve seats
        for (const seatId of seatIds) {
            await db.run(
                `INSERT INTO reservations (reservation_group_id, seat_id)
                 VALUES (?, ?)`,
                [group.lastID, seatId]
            );
        }

        await db.exec("COMMIT");

        emitReservationCreated({ id: groupId });

        res.status(201).json({
            message: "Reservation created successfully",
            reservationGroupId: group.lastID
        });

    } catch (err) {
        await db.exec("ROLLBACK");
        console.error(err);

        if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ error: "One or more seats already reserved" });
        }

        res.status(500).json({ error: "Failed to create reservation" });
    }
});

//see own reservations
router.get("/my", requireLogin, async (req, res) => {
    const userId = req.user.id;
    const type = req.query.type === "past" ? "<" : ">=";

    try {
        const reservations = await db.all(
            `
            SELECT
                rg.id AS reservationGroupId,
                m.title,
                s.show_datetime,
                GROUP_CONCAT(se.seat_number) AS seats,
                rg.created_at
            FROM reservation_groups rg
            JOIN showtimes s ON rg.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN reservations r ON r.reservation_group_id = rg.id
            JOIN seats se ON r.seat_id = se.id
            WHERE rg.user_id = ?
              AND s.show_datetime ${type} datetime('now')
            GROUP BY rg.id
            ORDER BY s.show_datetime
            `,
            [userId]
        );

        res.json({ reservations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch reservations" });
    }
});


//update (user)
router.put("/:groupId", requireLogin, async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    const { seatIds } = req.body;

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ error: "No seats provided" });
    }

    try {
        const group = await db.get(
            `SELECT * FROM reservation_groups WHERE id = ? AND user_id = ?`,
            [groupId, userId]
        );

        if (!group) {
            return res.status(403).json({ error: "Not authorized to update reservation" });
        }

        await db.exec("BEGIN");

        await db.run(
            `DELETE FROM reservations WHERE reservation_group_id = ?`,
            [groupId]
        );

        for (const seatId of seatIds) {
            await db.run(
                `INSERT INTO reservations (reservation_group_id, seat_id)
                 VALUES (?, ?)`,
                [groupId, seatId]
            );
        }

        await db.exec("COMMIT");

        emitReservationUpdated({ id: groupId });

        res.json({ message: "Reservation updated successfully" });

    } catch (err) {
        await db.exec("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Failed to update reservation" });
    }
});

//cancel (user)
router.delete("/:groupId", requireLogin, async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;

    try {
        const group = await db.get(
            `SELECT * FROM reservation_groups WHERE id = ? AND user_id = ?`,
            [groupId, userId]
        );

        if (!group) {
            return res.status(403).json({ error: "Not authorized to cancel reservation" });
        }

        await db.run(
            `DELETE FROM reservation_groups WHERE id = ?`,
            [groupId]
        );

        emitReservationDeleted(groupId);

        res.json({ message: "Reservation cancelled successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to cancel reservation" });
    }
});


//admin see active
router.get("/admin/active", requireLogin, requireAdmin, async (req, res) => {
    try {
        const reservations = await db.all(
            `
            SELECT
                rg.id,
                u.username,
                m.title,
                s.show_datetime,
                GROUP_CONCAT(se.seat_number) AS seats
            FROM reservation_groups rg
            JOIN users u ON rg.user_id = u.id
            JOIN showtimes s ON rg.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN reservations r ON r.reservation_group_id = rg.id
            JOIN seats se ON r.seat_id = se.id
            WHERE s.show_datetime >= datetime('now')
            GROUP BY rg.id
            ORDER BY s.show_datetime
            `
        );

        res.json({ reservations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch reservations" });
    }
});


//admin delete
router.delete("/admin/:groupId", requireLogin, requireAdmin, async (req, res) => {
    const { groupId } = req.params;

    try {
        await db.run(
            `DELETE FROM reservation_groups WHERE id = ?`,
            [groupId]
        );

        emitReservationDeleted(groupId);

        res.json({ message: "Reservation deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete reservation" });
    }
});



export default router;