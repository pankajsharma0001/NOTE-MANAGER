import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    addedBy: {
      type: String, // email of the superadmin who added them
    },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
