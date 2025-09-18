import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
  isAdmin: { type: Boolean, default: false },
  semester: { type: String },
  college: { type: String },
  address: { type: String },
  phone: { type: String },
  profileComplete: { type: Boolean, default: false }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
