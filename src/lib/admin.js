import { connectMongo } from "./mongodb";
import Admin from "../models/Admin";

export const ADMIN_EMAILS = [
  "sharmapankaj102030@gmail.com",
  "engineeringnotez@gmail.com",
];

export function isSuperAdminEmail(email) {
  return Boolean(email && ADMIN_EMAILS.includes(email));
}

export async function isAdminEmail(email) {
  if (!email) return false;
  
  // Super admins are always admins
  if (ADMIN_EMAILS.includes(email)) return true;

  // Check database for dynamically added admins
  try {
    await connectMongo();
    const admin = await Admin.findOne({ email });
    return Boolean(admin);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
