import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  await connectMongo();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ success: false, message: "Not authenticated" });

  try {
    const user = await User.findById(session.user.id).populate("favorites.noteId");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const favorites = user.favorites.map((fav) => ({
      noteId: fav.noteId._id,
      title: fav.noteId.title,
      semester: fav.semester,
    }));

    return res.status(200).json({ success: true, favorites });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
