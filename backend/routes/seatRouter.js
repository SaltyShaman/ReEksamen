import { Router } from "express";
import db from "../database/connection.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { emitSeatUpdated} from "../sockets/events/seatEvents.js";



const router = Router();


//see all seats by hall
router.get("/halls/:hallId/seats", requireLogin, requireAdmin, async (req, res) => {
    const { hallId } = req.params;

    const seats = await db.all(
        "SELECT id, seat_number, status FROM seats WHERE hall_id = ? ORDER BY seat_number",
        [hallId]
    );

    res.json({ seats });
});



/**
 * GET specific seat in hall (admin)
 */
router.get("/halls/:hallId/seats/:seatNumber", requireLogin, requireAdmin, async (req, res) => {
    const { hallId, seatNumber } = req.params;

    const seat = await db.get(
        "SELECT id, hall_id, seat_number, status FROM seats WHERE hall_id = ? AND seat_number = ?",
        [hallId, seatNumber]
    );

    if (!seat) {
        return res.status(404).json({ error: "Seat not found" });
    }

    res.json({ seat });
});


/**
 * UPDATE seat status (admin)
 */
router.patch("/halls/:hallId/seats/:seatNumber/status", requireLogin, requireAdmin, async (req, res) => {
    const { hallId, seatNumber } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["AVAILABLE", "BROKEN", "MAINTENANCE"];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid seat status" });
    }

    // Update by hall_id + seat_number
    const result = await db.run(
        "UPDATE seats SET status = ? WHERE hall_id = ? AND seat_number = ?",
        [status, hallId, seatNumber]
    );

    if (result.changes === 0) {
        return res.status(404).json({ error: "Seat not found" });
    }

    // Get updated seat for socket broadcast
    const updatedSeat = await db.get(
        "SELECT id, hall_id, seat_number, status FROM seats WHERE hall_id = ? AND seat_number = ?",
        [hallId, seatNumber]
    );

    emitSeatUpdated(updatedSeat);

    res.json({
        message: "Seat status updated",
        seat: { seat_number: updatedSeat.seat_number, status: updatedSeat.status }
    });
});


export default router;