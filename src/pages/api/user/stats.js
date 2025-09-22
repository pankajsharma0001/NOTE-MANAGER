import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";
import Note from "../../../models/Note";

export default async function handler(req, res) {
  await connectMongo();
  const { userId } = req.query;

  try {
    const user = await User.findById(userId).populate("lastReadNote");
    if (!user) return res.status(404).json({ error: "User not found" });

    const totalNotes = await Note.countDocuments();
    const completedNotes = user.notesProgress.filter(n => n.progress === 100).length;
    const percentCompleted = totalNotes ? Math.round((completedNotes / totalNotes) * 100) : 0;

    res.status(200).json({
      name: user.name,
      image: user.image,
      college: user.college,
      semester: user.semester,
      loginCount: user.loginCount,
      lastReadNote: user.lastReadNote,
      lastReadAt: user.lastReadAt,
      percentCompleted,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
