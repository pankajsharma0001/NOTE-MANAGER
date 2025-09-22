import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // refresh JWT every 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // 🔑 Runs on every request to keep token fresh
    async jwt({ token, account, profile }) {
      await connectMongo();

      // First login/signup
      if (account && profile) {
        let user = await User.findOne({ email: profile.email });

        if (!user) {
          user = await User.create({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          });
        } else {
          // Increment login count
          user.loginCount = (user.loginCount || 0) + 1;
          await user.save();
        }

        token.userId = user._id.toString();
      }

      // Always fetch latest data from DB
      if (token.userId) {
        const freshUser = await User.findById(token.userId).lean();
        if (freshUser) {
          token.name = freshUser.name;
          token.email = freshUser.email;
          token.image = freshUser.image;
          token.role = ["sharmapankaj102030@gmail.com"].includes(freshUser.email)
            ? "admin"
            : "user";
          token.semester = freshUser.semester || "";
          token.college = freshUser.college || "";
          token.address = freshUser.address || "";
          token.phone = freshUser.phone || "";
          token.loginCount = freshUser.loginCount || 0;
          token.lastReadNote = freshUser.lastReadNote || null;
          token.lastReadAt = freshUser.lastReadAt || null;
          token.profileComplete = freshUser.profileComplete || false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.role = token.role;
        session.user.semester = token.semester;
        session.user.college = token.college;
        session.user.address = token.address;
        session.user.phone = token.phone;
        session.user.loginCount = token.loginCount;
        session.user.lastReadNote = token.lastReadNote;
        session.user.lastReadAt = token.lastReadAt;
        session.user.profileComplete = token.profileComplete;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl + "/dashboard";
    },
  },
};

export default NextAuth(authOptions);
