import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";
import Note from "../../../models/Note";
import { requireSession } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await requireSession(req, res);
  if (!session) return;

  await connectMongo();

  try {
    const user = await User.findById(session.user.id).populate("lastReadNote");
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
