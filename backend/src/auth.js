import jwt from "jsonwebtoken";
import { db, toPublicUser } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "film-match-dev-secret";

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentification requise" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
    if (!row) return res.status(401).json({ error: "Utilisateur introuvable" });
    if (!row.active) {
      return res.status(403).json({ error: "Compte désactivé par un administrateur" });
    }
    req.user = toPublicUser(row);
    next();
  } catch {
    return res.status(401).json({ error: "Jeton invalide" });
  }
}

export function adminRequired(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Accès administrateur requis" });
  }
  next();
}
