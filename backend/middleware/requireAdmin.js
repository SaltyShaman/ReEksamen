export function requireAdmin(req, res, next) {


    //s
    if (!req.session.user) {
        res.status(401).json({message : "You are not logged in"});
    }

    if (req.session.user.role !== "ADMIN") {
        return res.status(403).json({message: "Access denied due to admin route"});
    }

    next();

}