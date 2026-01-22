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
router.get("/halls/:hallId/seats/:seatId", requireLogin, requireAdmin, async (req, res) => {
    const { hallId, seatId } = req.params;

    const seat = await db.get(
        "SELECT id, seat_number, status FROM seats WHERE id = ? AND hall_id = ?",
        [seatId, hallId]
    );

    if (!seat) {
        return res.status(404).json({ error: "Seat not found" });
    }

    res.json({ seat });
});



/**
 * UPDATE seat status (admin)
 */
router.patch("/halls/:hallId/seats/:seatId/status", requireLogin, requireAdmin, async (req, res) => {
    const { hallId, seatId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["AVAILABLE", "BROKEN", "MAINTENANCE"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid seat status" });
    }

    const result = await db.run(
        "UPDATE seats SET status = ? WHERE id = ? AND hall_id = ?",
        [status, seatId, hallId]
    );

    if (result.changes === 0) {
        return res.status(404).json({ error: "Seat not found" });
    }

    const updatedSeat = await db.get(
      "SELECT id, hall_id, seat_number, status FROM seats WHERE id = ?",
      [seatId]
    );

    emitSeatUpdated(updatedSeat);

    res.json({
        message: "Seat status updated",
        seat: { id: seatId, status }
    });
});


export default router;