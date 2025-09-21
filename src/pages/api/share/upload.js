// pages/api/share/upload.js
import { createRouter } from "next-connect";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { connectMongo } from "../../../lib/mongodb";
import PendingNote from "../../../models/PendingNote";

// --- Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });
const router = createRouter();

router.use(upload.single("file"));

router.post(async (req, res) => {
  await connectMongo();

  const { title, subject, semester, content, userId } = req.body;

  console.log("🟢 Body received in upload API:", req.body); // debug
  console.log("🟢 UserId received:", userId); // debug

  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  try {
    const isPdf = req.file.mimetype === "application/pdf";
    const resourceType = isPdf ? "image" : "auto";

    const extension = isPdf ? ".pdf" : "";
    const safeTitle = title
      ? title.trim().replace(/[^a-zA-Z0-9-_]/g, "_")
      : Date.now();
    const publicId = `notes/${safeTitle}-${Date.now()}${extension}`;

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            public_id: publicId,
            use_filename: true,
            unique_filename: false,
            format: isPdf ? "pdf" : undefined,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await streamUpload();

    // Save to MongoDB
    const newPendingNote = await PendingNote.create({
      title,
      subject,
      semester,
      content,
      fileUrl: result.secure_url,
      uploadedBy: userId || null,
    });

    console.log("🟢 Saved Note:", newPendingNote); // debug

    return res.status(200).json({ success: true, data: newPendingNote });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export const config = { api: { bodyParser: false } };

export default router.handler({
  onError: (err, req, res) =>
    res.status(500).json({ error: `Something went wrong: ${err.message}` }),
  onNoMatch: (req, res) =>
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` }),
});
