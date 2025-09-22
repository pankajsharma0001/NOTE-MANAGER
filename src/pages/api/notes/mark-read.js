import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";
import Note from "../../../models/Note";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  await connectMongo();

  const { userId, noteId, progress, semester} = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const existing = user.notesProgress.find(n => n.noteId.toString() === noteId);
    if (existing) {
      existing.progress = progress;
    } else {
      user.notesProgress.push({
        noteId,
        progress
      });
    }

    // Update lastReadNote
    user.lastReadNote = note._id;
    user.lastReadAt = new Date();

    await user.save();

    // Calculate % completed
    const totalNotes = await Note.countDocuments();
    const completedNotes = user.notesProgress.filter(n => n.progress === 100).length;
    const percentCompleted = totalNotes ? Math.round((completedNotes / totalNotes) * 100) : 0;

    res.status(200).json({
      success: true,
      lastReadNote: note,
      percentCompleted
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
