import { Router } from "express";
import db from "../database/connection.js"; 
import { requireLogin } from "../middleware/requireLogin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();


//see all halls (admin)
router.get("/", requireLogin, requireAdmin, async (req, res) => {

    try {
        const users = await db.all("SELECT id, name, total_seats, created_at FROM halls");
        res.json({users});
    } catch (err) {
        console.error(err);
        res.status(500).json({error : "Failed to fetch halls"});
    }
});

//get by id (admin)
router.get("/:id", requireLogin, requireAdmin, async (req, res) => {
    
    try {
        const user = await db.get(
            "SELECT id, name, role, created_at FROM halls WHERE id =?", //comma to allow for id as a parameter
            [req.params.id]
        );
        if (!user) return res.status(404).json({ error: "Hall not found" });
        res.json({ user });
    }  catch(err) {
        console.error(err);
        res.status(500).json({error : "Hall not found"});
    }
});

//delete hall (admin)
router.delete("/:id", requireLogin, requireAdmin, async (req, res) => {
    
    try {
        const hallId = req.params.id;

        const hall = await db.get(
            "SELECT * FROM hall WHERE id = ?", [hallId]);

            if (!hall) {
                    return res.status(404).json({ error: "Hall not found"});
            }

            await db.run("DELETE FROM halls WHERE id = ?", [hallId]);


            res.json({ message: `Hall with id ${hallId} successfully deleted` });


            //socket implementation - to-do

    } catch (err){
        console.error(err);
        res.status(500).json({ error: "Failed to delete hall" });
    }
});


// create hall (admin only)
router.post("/create", requireLogin, requireAdmin, async (req, res) => {
    try {
        const { name, totalSeats } = req.body;

        if (!name || !totalSeats) {
            return res.status(400).json({ error: "Name and total seats are required" });
        }

        if (totalSeats <= 0) {
            return res.status(400).json({ error: "Total seats must be greater than 0" });
        }

        const existing = await db.get(
            "SELECT * FROM halls WHERE name = ?",
            [name]
        );

        if (existing) {
            return res.status(400).json({ error: "Hall name already exists" });
        }

        const existingSeats = await db.get(
             "SELECT 1 FROM seats WHERE hall_id = ? LIMIT 1",
              [hallId]
        );

        if (!existingSeats) {
            for (let seatNumber = 1; seatNumber <= totalSeats; seatNumber++) {
                await db.run(
                    `INSERT INTO seats (hall_id, seat_number)
                    VALUES (?, ?)`,
                [hallId, seatNumber]
                );
            }
        }

        const result = await db.run(
            `INSERT INTO halls (name, total_seats)
             VALUES (?, ?)`,
            [name, totalSeats]
        );

        const hallId = result.lastID;

        //Seats should be generated here in the backend
        for (let seatNumber = 1; seatNumber <= totalSeats; seatNumber++) {
            await db.run(
                `INSERT INTO seats (hall_id, seat_number)
                 VALUES (?, ?)`,
                [hallId, seatNumber]
            );
        }

        res.status(201).json({
            message: "Hall created successfully",
            hall: {
                id: hallId,
                name,
                total_seats: totalSeats
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create hall" });
    }
});

//update name for hall. Total seats should not be changable.
// if a seat is unavaible (say broken) it should be marked as unavaible until fixed without affecting the amount of seats
router.put("/:id", requireLogin, requireAdmin, async (req, res) => {
    const { name } = req.body;
    const hallId = req.params.id;

    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    const hall = await db.get(
        "SELECT * FROM halls WHERE id = ?",
        [hallId]
    );

    if (!hall) {
        return res.status(404).json({ error: "Hall not found" });
    }

    await db.run(
        "UPDATE halls SET name = ? WHERE id = ?",
        [name, hallId]
    );

    res.json({ message: "Hall updated successfully" });
});



export default router;