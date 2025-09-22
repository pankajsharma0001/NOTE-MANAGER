import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  semester: { type: String, required: true },
  title: { type: String },     // optional cached title
  subject: { type: String },   // optional cached subject
});

const notesProgressSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
  progress: { type: Number, default: 0 }, // 0-100%
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    image: { type: String },
    semester: { type: String },
    college: { type: String },
    address: { type: String },
    phone: { type: String },
    profileComplete: { type: Boolean, default: false },
    favorites: [favoriteSchema],

    // 🔹 New dynamic fields
    loginCount: { type: Number, default: 1 },
    lastReadNote: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
    lastReadAt: Date,
    notesProgress: [notesProgressSchema],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
