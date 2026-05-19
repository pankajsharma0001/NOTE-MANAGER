import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";
import Note from "../../../models/Note";
import PendingNote from "../../../models/PendingNote";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }

  try {
    await connectMongo();

    // 1. Basic Counts
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalPending = await PendingNote.countDocuments();

    // 2. Total Views across all notes
    const viewsAggregation = await Note.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;

    // 3. Top 5 Most Viewed Notes
    const topViewedNotes = await Note.find({}, "title subject semester views upvotes downvotes")
      .sort({ views: -1 })
      .limit(5)
      .lean();

    // 4. Top Contributors (Users who uploaded the most notes)
    // We aggregate on Note's uploadedBy field, count them, then lookup the User details
    const topContributors = await Note.aggregate([
      { $group: { _id: "$uploadedBy", noteCount: { $sum: 1 } } },
      { $sort: { noteCount: -1 } },
      { $limit: 5 },
      { 
        $lookup: {
          from: "users", // Mongoose uses lowercased, pluralized collection names by default
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      { 
        $project: {
          _id: 1,
          noteCount: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          image: "$userDetails.image"
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalNotes,
        totalPending,
        totalViews,
        topViewedNotes,
        topContributors
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
