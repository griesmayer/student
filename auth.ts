import { NextFunction, Request, Response } from "express";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (req.session && req.session.user) {
        return next();
    }
    // For APIs, return 401. For MVC/Handlebars, use res.redirect('/login')
    res.status(401).json({ error: "Unauthorized" });
}
