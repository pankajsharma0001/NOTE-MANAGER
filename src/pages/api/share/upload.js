// pages/api/share/upload.js
import { createRouter } from "next-connect";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { connectMongo } from "../../../lib/mongodb";
import PendingNote from "../../../models/PendingNote";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const router = createRouter();

router.use(upload.single("file"));

router.post(async (req, res) => {
  await connectMongo();

  const { title, subject, semester, description, userId } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  try {
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await streamUpload();

    const newPendingNote = await PendingNote.create({
      title,
      subject,
      semester,
      description,
      fileUrl: result.secure_url,
      uploadedBy: userId || null,
    });

    res.status(200).json({ success: true, data: newPendingNote });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export const config = { api: { bodyParser: false } };

export default router.handler({
  onError: (err, req, res) =>
    res.status(500).json({ error: `Something went wrong: ${err.message}` }),
  onNoMatch: (req, res) =>
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` }),
});
