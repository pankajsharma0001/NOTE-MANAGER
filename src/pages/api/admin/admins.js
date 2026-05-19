import { connectMongo } from "../../../lib/mongodb";
import Admin from "../../../models/Admin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { isSuperAdminEmail } from "../../../lib/admin";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user || !session.user.superadmin) {
    return res.status(403).json({ success: false, message: "Super Admin access required" });
  }

  await connectMongo();

  if (req.method === "GET") {
    try {
      const admins = await Admin.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: admins });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      if (isSuperAdminEmail(email)) {
        return res.status(400).json({ success: false, message: "This email is already a hardcoded Super Admin" });
      }

      const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
      if (existingAdmin) {
        return res.status(400).json({ success: false, message: "Admin already exists" });
      }

      const newAdmin = await Admin.create({
        email: email.toLowerCase().trim(),
        addedBy: session.user.email
      });

      return res.status(201).json({ success: true, data: newAdmin });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      await Admin.findOneAndDelete({ email: email.toLowerCase().trim() });
      return res.status(200).json({ success: true, message: "Admin removed successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
