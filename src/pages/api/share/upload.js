// pages/api/share/upload.js
import { createRouter } from "next-connect";
import multer from "multer";
import path from "path";
import fs from "fs";
import { connectMongo } from "../../../lib/mongodb";
import PendingNote from "../../../models/PendingNote";

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

const router = createRouter();
router.use(upload.single("file"));

router.post(async (req, res) => {
  await connectMongo();

  const { title, subject, semester, description, userId } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  try {
    const newPendingNote = await PendingNote.create({
      title,
      subject,
      semester,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: userId || null,
    });

    res.status(200).json({ success: true, data: newPendingNote });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router.handler({
  onError: (err, req, res) =>
    res.status(500).json({ error: `Something went wrong: ${err.message}` }),
  onNoMatch: (req, res) =>
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` }),
});

export const config = { api: { bodyParser: false } };
