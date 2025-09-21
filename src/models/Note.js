import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String },
  semester: { type: String }, // e.g., "first", "second"
  content: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedAt: { type: Date, default: Date.now },
  fileUrl: { type: String }, // 📂 URL for uploaded file (PDF, image, etc.)
});

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
