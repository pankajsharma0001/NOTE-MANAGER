import {connectMongo} from "../../../lib/mongodb";
import Note from "../../../models/Note";

export default async function handler(req, res) {
  await connectMongo();

  if (req.method === "POST") {
    try {
      const { title, subject, semester, content, userId } = req.body;

      const newNote = await Note.create({
        title,
        subject,
        semester,
        content,
        createdBy: userId,
      });

      return res.status(201).json({ success: true, data: newNote });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
