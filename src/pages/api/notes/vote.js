import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { noStore } from "../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  await connectMongo();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { noteId, action } = req.body;
  const userId = session.user.id;

  if (!noteId || !action || !["upvote", "downvote"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid request body" });
  }

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    const hasUpvoted = (note.upvotes || []).some(id => id.toString() === userId);
    const hasDownvoted = (note.downvotes || []).some(id => id.toString() === userId);

    let update = {};

    if (action === "upvote") {
      if (hasUpvoted) {
        // Toggle off
        update = { $pull: { upvotes: userId } };
      } else {
        // Add upvote, remove downvote if exists
        update = { $addToSet: { upvotes: userId }, $pull: { downvotes: userId } };
      }
    } else if (action === "downvote") {
      if (hasDownvoted) {
        // Toggle off
        update = { $pull: { downvotes: userId } };
      } else {
        // Add downvote, remove upvote if exists
        update = { $addToSet: { downvotes: userId }, $pull: { upvotes: userId } };
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(noteId, update, { new: true });

    return res.status(200).json({
      success: true,
      upvotes: (updatedNote.upvotes || []).length,
      downvotes: (updatedNote.downvotes || []).length,
      hasUpvoted: (updatedNote.upvotes || []).some(id => id.toString() === userId),
      hasDownvoted: (updatedNote.downvotes || []).some(id => id.toString() === userId)
    });
  } catch (error) {
    console.error("Voting error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
