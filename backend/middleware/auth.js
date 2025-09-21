import jwt from "jsonwebtoken";

export async function requireAuth(req, res, next) {
  // Dev bypass (single gate)
  if (process.env.NO_AUTH === "1") {
    req.user = { uid: process.env.DEV_UID || "demo-driver-uid", roles: ["driver"], email: "dev@local" };
    try {
      const date = req.query?.date;
      console.log(`[auth] dev bypass uid=${req.user.uid}${date ? ` date=${date}` : ""}`);
    } catch {}
    return next();
  }

  try {
    const auth = req.header("authorization") || req.header("Authorization");
    if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ error: "Missing bearer token" });
    }
    const token = auth.slice(7);
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const payload = jwt.verify(token, secret);
    req.user = { uid: String(payload.sub), roles: payload.roles || [] };
    try {
      const date = req.query?.date;
      const roles = Array.isArray(req.user.roles) ? req.user.roles.join(",") : "";
      console.log(`[auth] ok uid=${req.user.uid}${roles ? ` roles=${roles}` : ""}${date ? ` date=${date}` : ""}`);
    } catch {}
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRoles(...allowed) {
  return (req, res, next) => {
    try {
      const roles = req.user?.roles || [];
      if (!Array.isArray(roles) || allowed.some(r => roles.includes(r))) return next();
      return res.status(403).json({ error: "Forbidden" });
    } catch {
      return res.status(403).json({ error: "Forbidden" });
    }
  };
}
