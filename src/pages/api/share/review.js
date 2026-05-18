import {connectMongo} from "../../../lib/mongodb";
import PendingNote from "../../../models/PendingNote";
import Note from "../../../models/Note";
import { requireAdmin } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  if (req.method === "POST") {
    if (!(await requireAdmin(req, res))) return;

    await connectMongo();

    try {
      const { id, action } = req.body;

      if (!id || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ success: false, message: "Invalid request" });
      }

      const status = action === "approve" ? "approved" : "rejected";

      const pending = await PendingNote.findById(id);

      if (!pending) {
        return res.status(404).json({ success: false, message: "Pending note not found" });
      }

      if (status === "approved") {
        await Note.create({
          title: pending.title,
          subject: pending.subject,
          semester: pending.semester,
          content: pending.content,
          fileUrl: pending.fileUrl,
          uploadedBy: pending.uploadedBy,
        });
      }

      await PendingNote.findByIdAndDelete(id);

      res.status(200).json({ success: true, status });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to update note" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
