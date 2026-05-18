import { connectMongo } from "../../../../lib/mongodb";
import PendingNote from "../../../../models/PendingNote";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "../../../../lib/serverAuth";
import { noStore } from "../../../../lib/apiCache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, JPG, PNG, and WEBP files are allowed"));
  },
});

export const config = {
  api: {
    bodyParser: false, // required for multer
  },
};

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  if (!(await requireAdmin(req, res))) return;

  await connectMongo();
  const { id } = req.query;

  upload.single("file")(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    try {
      const { title, subject, semester, content } = req.body;
      let updateData = { title, subject, semester, content };

      if (req.file) {
        // Convert file buffer to base64 string
        const fileBuffer = req.file.buffer;
        const fileStr = `data:${req.file.mimetype};base64,${fileBuffer.toString("base64")}`;

        const isPdf = req.file.mimetype === "application/pdf";
        const result = await cloudinary.uploader.upload(fileStr, {
          resource_type: isPdf ? "image" : "auto",
          folder: "notes",
          public_id: `${Date.now()}`,
          format: isPdf ? "pdf" : undefined,
        });

        updateData.fileUrl = result.secure_url;
      }

      const note = await PendingNote.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      if (!note) return res.status(404).json({ success: false, message: "Note not found" });

      res.status(200).json({ success: true, data: note });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
}
