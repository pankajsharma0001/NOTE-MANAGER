import {connectMongo} from "../../../lib/mongodb";
import Note from "../../../models/Note";

export default async function handler(req, res) {
  await connectMongo();

  if (req.method === "POST") {
    try {
      const { id, action } = req.body;

      if (!id || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ success: false, message: "Invalid request" });
      }

      const status = action === "approve" ? "approved" : "rejected";

      const updatedNote = await Note.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedNote) {
        return res.status(404).json({ success: false, message: "Note not found" });
      }

      res.status(200).json({ success: true, note: updatedNote });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to update note" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
