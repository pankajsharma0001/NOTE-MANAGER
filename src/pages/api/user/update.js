import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  await connectMongo();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, name, semester, college, address, phone, profileComplete } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (semester !== undefined) updateFields.semester = semester;
    if (college !== undefined) updateFields.college = college;
    if (address !== undefined) updateFields.address = address;
    if (phone !== undefined) updateFields.phone = phone;
    if (profileComplete !== undefined) updateFields.profileComplete = profileComplete;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateFields,
      { new: true, useFindAndModify: false } // important for Mongoose
    ).lean(); // <- convert to plain JS object

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
