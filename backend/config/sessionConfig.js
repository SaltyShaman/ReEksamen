import session from "express-session";

export default session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // only save session after login
    cookie: {
        secure: false, // true if HTTPS
        httpOnly: true,
        sameSite: "lax" // important for cross-origin dev localhost
    }
});
