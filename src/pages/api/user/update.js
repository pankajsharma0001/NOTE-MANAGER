import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";
import { requireSession } from "../../../lib/serverAuth";
import { noStore } from "../../../lib/apiCache";

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await requireSession(req, res);
  if (!session) return;

  await connectMongo();

  try {
    const { name, semester, college, address, phone, profileComplete } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (semester !== undefined) updateFields.semester = semester;
    if (college !== undefined) updateFields.college = college;
    if (address !== undefined) updateFields.address = address;
    if (phone !== undefined) updateFields.phone = phone;
    if (profileComplete !== undefined) updateFields.profileComplete = profileComplete;

    const updatedUser = await User.findOneAndUpdate(
      { _id: session.user.id },
      updateFields,
      { new: true, useFindAndModify: false } // important for Mongoose
    ).lean(); // <- convert to plain JS object

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
