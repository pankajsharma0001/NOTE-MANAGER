import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";
import { noStore } from "../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  await connectMongo();

  if (req.method === "GET") {
    try {
      const { semester, subject } = req.query;
      if (!semester) {
        return res.status(400).json({ success: false, message: "Semester required" });
      }

      // Build filter object
      let filter = { semester: semester.toLowerCase().trim() };
      if (subject) {
        filter.subject = subject.trim(); // filter by selected subject
      }

      const notes = await Note.find(filter).sort({ uploadedAt: -1, createdAt: -1 });

      return res.status(200).json({ success: true, data: notes });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
