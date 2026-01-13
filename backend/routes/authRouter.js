import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../database/connection.js";

const router = Router();


//login
router.post("/login", async (req, res) => {

    try {
        const {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).json({message : "Please fill in login information"});
        }

        const user = await db.get(
            'SELECT id, username, password_hash, role FROM users WHERE username =?', 
            [username]
        );

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        //start a session
        req.session.user = {
            id : user.id,
            username: user.username,
            role: user.role
        }

        res.json({
            message: "Login succesfull",
            user: req.session.user
        });


        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Login failed"});
        }
});

//logout
router.post("/logout", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({error: "You are not logged in"})
    }

    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.json({ message: "Logged out" });
    });
})

export default router;