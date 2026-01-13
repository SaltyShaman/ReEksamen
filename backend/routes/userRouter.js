import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../database/connection.js"; 
import { requireLogin } from "../middleware/requireLogin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";


/* use cases

    admin: can see all users (done), delete user (done) and access user by id (done) and change password
    user:  and terminate his own account (done) and register a new user (without login) and change password (done)

*/
const router = Router();


router.get("/", requireLogin, requireAdmin, async (req, res) => {

    try {
        const users = await db.all("SELECT id, username, role, created_at FROM users");
        res.json({users});
    } catch (err) {
        console.error(err);
        res.status(500).json({error : "Failed to fetch users"});
    }
});

//get by id
router.get("/:id", requireLogin, requireAdmin, async (req, res) => {
    
    try {
        const user = await db.get(
            "SELECT id, username, role, created_at FROM users WHERE id =?", //comma to allow for id as a parameter
            [req.params.id]
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user });
    }  catch(err) {
        console.error(err);
        res.status(500).json({error : "User not found"});
    }
});

//admin delete
router.delete("/:id", requireLogin, requireAdmin, async (req, res) => {
    
    try {
        const userId = req.params.id;

        const user = await db.get(
            "SELECT * FROM users WHERE id = ?", [userId]);

            if (!user) {
                    return res.status(404).json({ error: "User not found"});
            }

            await db.run("DELETE FROM users WHERE id = ?", [userId]);

            res.json({ message: `User with id ${userId} successfully deleted` });


    } catch (err){
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

//user own delete
router.delete("/me", requireLogin, async (req, res) => {

    try {

        const userId = req.session.user.id;
        const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
        
          if (!user) {
                          return res.status(404).json({ error: "User not found"});
            }    
            
        await db.run("DELETE FROM users WHERE id = ?", [userId]);

        res.json({ message: "Your user has now been sucessfully deleted"});
    } catch(err){
        console.error(err);
        res.status(500).json({error: "Delete failed"});
    }
});

//change password
router.put("/me", requireLogin, async (req, res) => {

    try {
         const userId = req.session.user.id;
         const { newPassword } = req.body;

         const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.run("UPDATE users SET password_hash = ? WHERE id = ?", [hashedPassword, userId]);

        res.json({message: "Password succesfully updated"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Password update failed"});
    }
});


//public register account (NO LOGIN!)
router.post("/register", async (req, res) => {

    try {
        const {username, password} = req.body;

        const existing = await db.get("SELECT * FROM users WHERE username = ?", [username]);
        if (existing) {
            return res.status(400).json({error: "Username already in use"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.run(
            "INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
                 [username, hashedPassword, "USER", new Date().toISOString()]); //important: you can only register as a new user
        
        res.status(201).json({ message: "User registered successfully", id: result.lastID });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to register user"});
    }
});

export default router;