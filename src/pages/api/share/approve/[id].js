import {connectMongo} from "../../../../lib/mongodb";
import PendingNote from "../../../../models/PendingNote";
import Note from "../../../../models/Note";
import { requireAdmin } from "../../../../lib/serverAuth";
import { noStore } from "../../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  if (req.method === "POST") {
    if (!(await requireAdmin(req, res))) return;

    await connectMongo();
    const { id } = req.query;

    try {
      const pending = await PendingNote.findById(id);
      if (!pending) return res.status(404).json({ success: false, message: "Pending note not found" });

      // Move to main Note collection
      await Note.create({
        title: pending.title,
        subject: pending.subject,
        semester: pending.semester, // already stored as "first", "second", etc.
        content: pending.content,
        fileUrl: pending.fileUrl,
        uploadedBy: pending.uploadedBy,
      });

      // Remove from PendingNote
      await PendingNote.findByIdAndDelete(id);

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.status(405).json({ success: false, message: "Method not allowed" });
}
