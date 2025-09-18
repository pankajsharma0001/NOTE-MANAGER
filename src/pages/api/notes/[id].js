import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";

export default async function handler(req, res) {
  await connectMongo();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const note = await Note.findById(id);
      if (!note) return res.status(404).json({ success: false, message: "Note not found" });
      return res.status(200).json({ success: true, data: note });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  res.status(405).json({ success: false, message: "Method not allowed" });
}
