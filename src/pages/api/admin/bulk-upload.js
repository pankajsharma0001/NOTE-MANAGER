import { createRouter } from "next-connect";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";
import { requireAdmin } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Only PDF, JPG, PNG, and WEBP files are allowed"));
    },
});

const router = createRouter();

router.use(async (req, res, next) => {
    noStore(res);
    const session = await requireAdmin(req, res);
    if (!session) return;

    req.session = session;
    return next();
});

router.use(upload.array("files", 20)); // Limit to 20 files at once

router.post(async (req, res) => {
    await connectMongo();

    const { subject, semester, content } = req.body;

    if (!subject || !semester) {
        return res.status(400).json({ success: false, error: "Subject and semester are required" });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: "No files uploaded" });
    }

    try {
        const uploadedNotes = [];

        for (const file of req.files) {
            const isPdf = file.mimetype === "application/pdf";
            const resourceType = isPdf ? "image" : "auto";

            // Use the file originalName (without extension) as title
            const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
            const title = originalNameWithoutExt || "Untitled";

            const safeTitle = title.trim().replace(/[^a-zA-Z0-9-_]/g, "_");
            const publicId = `notes/${safeTitle}-${Date.now()}`;

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
                    stream.end(file.buffer);
                });

            const result = await streamUpload();

            const newNote = await Note.create({
                title,
                subject,
                semester,
                content: content || title,
                fileUrl: result.secure_url,
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

export const config = { api: { bodyParser: false } };

export default router.handler({
    onError: (err, req, res) =>
        res.status(400).json({ success: false, error: err.message }),
    onNoMatch: (req, res) =>
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` }),
});