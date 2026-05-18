import {connectMongo} from "../../../lib/mongodb";
import Note from "../../../models/Note";
import { requireAdmin } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  if (req.method === "POST") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    await connectMongo();

    try {
      const { title, subject, semester, content } = req.body;

      const newNote = await Note.create({
        title,
        subject,
        semester,
        content,
        uploadedBy: session.user.id,
      });

      return res.status(201).json({ success: true, data: newNote });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
