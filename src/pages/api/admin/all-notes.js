import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";
import { requireAdmin } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  await connectMongo();

  try {
    const { semester, subject } = req.query;
    const filter = {};

    if (semester) filter.semester = semester.toLowerCase().trim();
    if (subject) filter.subject = subject.trim();

    const notes = await Note.find(filter)
      .populate("uploadedBy", "name email image")
      .sort({ uploadedAt: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data: notes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
