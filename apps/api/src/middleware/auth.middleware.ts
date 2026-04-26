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
  const queryToken = req.query.token as string | undefined;

  let token: string | undefined;

  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    res.status(401).json({ error: "Authorization required" });
    return;
  }
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
