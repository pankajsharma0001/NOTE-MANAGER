import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  await connectMongo();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, name, semester, college, address, phone } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        name,
        semester,
        college,
        address,
        phone,
        profileComplete: true, // mark profile as completed
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
