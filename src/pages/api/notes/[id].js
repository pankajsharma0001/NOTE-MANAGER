import { connectMongo } from "../../../lib/mongodb";
import Note from "../../../models/Note";
import User from "../../../models/User";
import { noStore } from "../../../lib/apiCache";
import { requireAdmin } from "../../../lib/serverAuth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default async function handler(req, res) {
  noStore(res);
  await connectMongo();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      // Populate uploadedBy to get name, email, and image. Also increment view count.
      const note = await Note.findByIdAndUpdate(
        id, 
        { $inc: { views: 1 } },
        { new: true }
      ).populate("uploadedBy", "name email image");

      if (!note) {
        return res.status(404).json({ success: false, message: "Note not found" });
      }

      return res.status(200).json({ success: true, data: note });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin-only: Edit a note
  if (req.method === "PUT") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    try {
      const { title, subject, semester, content, fileUrl } = req.body;
      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (subject !== undefined) updateData.subject = subject;
      if (semester !== undefined) updateData.semester = semester;
      if (content !== undefined) updateData.content = content;
      if (fileUrl !== undefined) updateData.fileUrl = fileUrl;

      const updated = await Note.findByIdAndUpdate(id, updateData, { new: true })
        .populate("uploadedBy", "name email image");

      if (!updated) {
        return res.status(404).json({ success: false, message: "Note not found" });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin-only: Delete a note
  if (req.method === "DELETE") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    try {
      const noteToDelete = await Note.findById(id);

      if (!noteToDelete) {
        return res.status(404).json({ success: false, message: "Note not found" });
      }

      // If there's a Cloudinary file URL, delete it from Cloudinary
      if (noteToDelete.fileUrl && noteToDelete.fileUrl.includes('cloudinary.com')) {
        try {
          const urlParts = noteToDelete.fileUrl.split('/upload/');
          if (urlParts.length > 1) {
            // Remove the version string and extension to get the public_id
            const pathAndFile = urlParts[1].split('/').slice(1).join('/'); 
            const publicId = pathAndFile.substring(0, pathAndFile.lastIndexOf('.')) || pathAndFile;
            
            // Delete the file from Cloudinary
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (cloudinaryErr) {
          console.error("Failed to delete from Cloudinary:", cloudinaryErr);
        }
      }

      const deleted = await Note.findByIdAndDelete(id);

      // Clean up favorites referencing this note
      await User.updateMany(
        { "favorites.noteId": id },
        { $pull: { favorites: { noteId: id } } }
      );

      // Clean up notesProgress referencing this note
      await User.updateMany(
        { "notesProgress.noteId": id },
        { $pull: { notesProgress: { noteId: id } } }
      );

      return res.status(200).json({ success: true, message: "Note deleted" });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  res.status(405).json({ success: false, message: "Method not allowed" });
}
