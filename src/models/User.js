import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  image: String,
  semester: String,
  college: String,
  address: String,
  phone: String,

  // Favorites will store noteId + semester
  favorites: [
    {
      noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
      semester: { type: String, required: true },
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
