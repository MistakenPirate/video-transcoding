import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Let CORS preflight through without auth
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authorization header required" });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({ error: "Invalid authorization format. Use: Bearer <token>" });
    return;
  }

  const token = parts[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = {
    userId: payload.userId,
    email: payload.email,
  };

  next();
}
