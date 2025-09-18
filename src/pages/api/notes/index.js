import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";

export default async function handler(req, res) {
  await connectMongo();

  if (req.method === "GET") {
    try {
      const { semester } = req.query;
      if (!semester) return res.status(400).json({ success: false, message: "Semester required" });

      const notes = await Note.find({ semester: semester.toLowerCase().trim() }).sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: notes });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
