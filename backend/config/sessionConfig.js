import session from "express-session";

export default session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } //change to true when using HTTPS
});