import {connectMongo} from "../../../../lib/mongodb";
import PendingNote from "../../../../models/PendingNote";
import { requireAdmin } from "../../../../lib/serverAuth";
import { noStore } from "../../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  if (req.method === "POST") {
    if (!(await requireAdmin(req, res))) return;

    await connectMongo();
    const { id } = req.query;

    try {
      // Remove from PendingNote
      await PendingNote.findByIdAndDelete(id);

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.status(405).json({ success: false, message: "Method not allowed" });
}
