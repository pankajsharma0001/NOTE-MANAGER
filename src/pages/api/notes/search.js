import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(200).json({ success: true, data: [] });
  }

  try {
    await connectMongo();

    // Search by regex in title or subject (case insensitive)
    const regex = new RegExp(q.trim(), "i");
    const results = await Note.find(
      { $or: [{ title: regex }, { subject: regex }] },
      "title subject semester views"
    )
      .sort({ views: -1 })
      .limit(6)
      .lean();

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Search API Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
