import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export async function requireSession(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return null;
  }

  return session;
}

export async function requireAdmin(req, res) {
  const session = await requireSession(req, res);
  if (!session) return null;

  if (session.user.role !== "admin") {
    res.status(403).json({ success: false, message: "Admin access required" });
    return null;
  }

  return session;
}
