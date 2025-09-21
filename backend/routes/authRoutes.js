import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.status === "blocked") return res.status(403).json({ error: "Account blocked" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const expiresIn = process.env.JWT_EXPIRES_IN || "24h";
    const token = jwt.sign({ sub: String(user._id), roles: user.roles || [] }, secret, { expiresIn });

    return res.json({ token, user: { id: String(user._id), email: user.email, roles: user.roles || [] } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
});

export default router;




