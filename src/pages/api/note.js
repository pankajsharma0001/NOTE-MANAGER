import dbConnect from "../../utils/dbConnect";
import Note from "../../models/Note";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const notes = await Note.find({});
    return res.json(notes);
  }

  if (req.method === "POST") {
    const { title, content } = req.body;
    const newNote = await Note.create({ title, content });
    return res.json(newNote);
  }

  res.status(405).end(); // Method Not Allowed
}
