import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session)
    return res.status(401).json({ success: false, error: "Not authenticated" });

  const { noteId, semester, title } = req.body;
  if (!noteId || !semester)
    return res.status(400).json({ success: false, error: "Missing fields" });

  await connectMongo();

  try {
    const user = await User.findById(session.user.id);
    const index = user.favorites.findIndex(
      (fav) => fav.noteId.toString() === noteId && fav.semester === semester
    );

    if (index > -1) {
      // Remove from favorites
      user.favorites.splice(index, 1);
      await user.save();
      return res.json({ success: true, favorited: false });
    } else {
      // Add to favorites
      user.favorites.push({ noteId, semester, title });
      await user.save();
      return res.json({ success: true, favorited: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
