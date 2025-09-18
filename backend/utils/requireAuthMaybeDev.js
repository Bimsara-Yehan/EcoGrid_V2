// backend/utils/requireAuthMaybeDev.js
export function requireAuthMaybeDev(req, res, next) {
  // Dev shortcut
  if (process.env.NO_AUTH === "1") {
    const override = req.query.devUid || req.header("x-dev-uid");
    req.user = { uid: String(override || process.env.DEV_UID || "demo-driver-uid") };
    return next();
  }
  // If you already have your real Firebase auth middleware, use that here:
  // return requireAuth(req, res, next)
  return res.status(401).json({ error: "Auth disabled in this environment" });
}
