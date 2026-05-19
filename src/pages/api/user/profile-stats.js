import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await connectMongo();

    // Fetch notes uploaded by this user
    const notes = await Note.find(
      { uploadedBy: session.user.id },
      "title subject semester views upvotes downvotes fileUrl createdAt"
    )
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total upvotes earned across all uploaded notes
    let totalUpvotes = 0;
    notes.forEach((note) => {
      if (note.upvotes) {
        totalUpvotes += note.upvotes.length;
      }
    });

    // Compute dynamic badge/rank based on number of contributions
    let badge = "Newbie Uploader 🌱";
    let color = "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30";
    
    if (notes.length > 5) {
      badge = "Legend Contributor 🏆";
      color = "from-yellow-500/20 to-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse";
    } else if (notes.length >= 3) {
      badge = "Expert Contributor 🎓";
      color = "from-purple-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30";
    } else if (notes.length >= 1) {
      badge = "Rising Star 💫";
      color = "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30";
    }

    return res.status(200).json({
      success: true,
      data: {
        notes,
        totalUpvotes,
        badge: {
          name: badge,
          color,
        },
      },
    });
  } catch (error) {
    console.error("Profile Stats Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
