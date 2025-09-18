// pages/api/share/pending.js
import {connectMongo} from "../../../lib/mongodb";
import PendingNote from "../../../models/PendingNote";
import User from "../../../models/User";

export default async function handler(req, res) {
  await connectMongo();

  if (req.method === "GET") {
    try {
      const pendingNotes = await PendingNote.find({ status: "pending" })
        .populate("uploadedBy", "email name") // get uploader info
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
