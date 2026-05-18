// pages/api/share/upload.js
import { createRouter } from "next-connect";
import { v2 as cloudinary } from "cloudinary";
import { connectMongo } from "../../../lib/mongodb";
import PendingNote from "../../../models/PendingNote";
import { requireSession } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const router = createRouter();

router.use(async (req, res, next) => {
  noStore(res);
  const session = await requireSession(req, res);
  if (!session) return;

  req.session = session;
  return next();
});

// Endpoint to generate Cloudinary signature
router.get(async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const { publicId, format } = req.query;

    const paramsToSign = { timestamp };
    if (publicId) paramsToSign.public_id = publicId;
    if (format) paramsToSign.format = format;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_SECRET
    );

    res.status(200).json({ timestamp, signature });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate signature" });
  }
});

// Endpoint to save the note in the database after the client uploads to Cloudinary
router.post(async (req, res) => {
  await connectMongo();

  const { title, subject, semester, content, fileUrl } = req.body;

  if (!title || !subject || !semester || !fileUrl) {
    return res.status(400).json({ success: false, error: "Title, subject, semester, and fileUrl are required" });
  }

  try {
    const newPendingNote = await PendingNote.create({
      title,
      subject,
      semester,
      content,
      fileUrl,
      uploadedBy: req.session.user.id,
    });

    return res.status(200).json({ success: true, data: newPendingNote });
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
