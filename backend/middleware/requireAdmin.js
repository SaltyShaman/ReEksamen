export function requireAdmin(req, res, next) {


    //use a session validation here to avoid sending another request to requirelogin
    //basicly choose if you want it as a function parameter or a direct validation in the function
    if (!req.session.user) {
        res.status(401).json({message : "You are not logged in"});
    }

    if (req.session.user.role !== "ADMIN") {
        return res.status(403).json({message: "Access denied due to admin route"});
    }

    next();

}