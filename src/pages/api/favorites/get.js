import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  await connectMongo();
  const session = await getServerSession(req, res, authOptions);
  if (!session)
    return res.status(401).json({ success: false, message: "Not authenticated" });

  try {
    const user = await User.findById(session.user.id).select("favorites");
    return res.status(200).json({ success: true, favorites: user.favorites || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
