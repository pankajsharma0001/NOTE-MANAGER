import { connectMongo } from "../../lib/mongodb";
import User from "../../models/User";
import Note from "../../models/Note";
import PendingNote from "../../models/PendingNote";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    try {
        await connectMongo();

        const totalStudents = await User.countDocuments();
        const totalNotes = await Note.countDocuments();
        const totalPendingNotes = await PendingNote.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalNotes,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
