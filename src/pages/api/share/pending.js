// pages/api/share/pending.js
import {connectMongo} from "../../../lib/mongodb";
import PendingNote from "../../../models/PendingNote";
import { requireAdmin } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  if (req.method === "GET") {
    if (!(await requireAdmin(req, res))) return;

    await connectMongo();

    try {
      const pendingNotes = await PendingNote.find({ status: "pending" })
        .populate("uploadedBy", "email name image semester college address phone") // get uploader info
        .sort({ uploadedAt: -1 });

      return res.status(200).json({ success: true, data: pendingNotes });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
