export async function requireAuth(req, res, next) {
  // Dev bypass: use .env NO_AUTH=1 and DEV_UID=...
  if (process.env.NO_AUTH === "1") {
    req.user = { uid: process.env.DEV_UID || "demo-driver-uid", email: "dev@local" };
    return next();
  }

  // If you later enable Firebase Admin, verify the token here.
  // For now we only need the dev bypass.
  return res.status(401).json({ message: "Auth disabled in dev env" });
}
