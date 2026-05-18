import { createRouter } from "next-connect";
import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";
import { requireAdmin } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

const router = createRouter();

router.use(async (req, res, next) => {
    noStore(res);
    const session = await requireAdmin(req, res);
    if (!session) return;

    req.session = session;
    return next();
});

router.post(async (req, res) => {
    await connectMongo();

    const { subject, semester, content, files } = req.body;

    if (!subject || !semester) {
        return res.status(400).json({ success: false, error: "Subject and semester are required" });
    }

    if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: "No files provided" });
    }

    try {
        const uploadedNotes = [];

        for (const fileData of files) {
            const { title, fileUrl } = fileData;

            const newNote = await Note.create({
                title,
                subject,
                semester,
                content: content || title,
                fileUrl,
                uploadedBy: req.session.user.id,
            });

            uploadedNotes.push(newNote);
        }

        return res.status(200).json({ success: true, data: uploadedNotes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default router.handler({
    onError: (err, req, res) =>
        res.status(400).json({ success: false, error: err.message }),
    onNoMatch: (req, res) =>
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` }),
});
res.status(405).json({ error: `Method '${req.method}' Not Allowed` }),
});