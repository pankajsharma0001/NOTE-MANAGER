import {connectMongo} from "../../../../lib/mongodb";
import PendingNote from "../../../../models/PendingNote";

export default async function handler(req, res) {
  await connectMongo();
  const { id } = req.query;

  if (req.method === "POST") {
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