import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  await connectMongo();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ success: false, message: "Not authenticated" });

  const { noteId, semester } = req.body;
  if (!noteId || !semester) return res.status(400).json({ success: false, message: "Invalid data" });

  try {
    const user = await User.findById(session.user.id);

    const index = user.favorites.findIndex(
      (fav) => fav.noteId.toString() === noteId && fav.semester === semester
    );

    if (index > -1) {
      // Remove from favorites
      user.favorites.splice(index, 1);
    } else {
      // Add to favorites
      user.favorites.push({ noteId, semester });
    }

    await user.save();
    return res.status(200).json({ success: true, favorites: user.favorites });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
