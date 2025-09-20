import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  semester: { type: String, required: true },
  title: { type: String },
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
    favorites: [favoriteSchema],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
