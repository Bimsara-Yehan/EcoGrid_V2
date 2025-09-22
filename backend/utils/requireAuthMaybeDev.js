// backend/utils/requireAuthMaybeDev.js
import { requireAuth } from "../middleware/auth.js";

export function requireAuthMaybeDev(req, res, next) {
  return requireAuth(req, res, next);
}
