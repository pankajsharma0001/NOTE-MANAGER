// models/PendingNote.js
import mongoose from "mongoose";

const PendingNoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  semester: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // track user
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
});

export default mongoose.models.PendingNote || mongoose.model("PendingNote", PendingNoteSchema);
