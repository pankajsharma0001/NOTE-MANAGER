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
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account, profile }) {
      await connectMongo();

      if (account && profile) {
        let user = await User.findOne({ email: profile.email });

        if (!user) {
          user = await User.create({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          });
        } else {
          // 🔹 Increment login count
          user.loginCount = (user.loginCount || 0) + 1;
          await user.save();
        }

        token.userId = user._id.toString();
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = ["sharmapankaj102030@gmail.com"].includes(user.email)
          ? "admin"
          : "user";
        token.semester = user.semester || "";
        token.college = user.college || "";
        token.address = user.address || "";
        token.phone = user.phone || "";
        token.loginCount = user.loginCount || 0;
        token.lastReadNote = user.lastReadNote || null;
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
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl + "/dashboard";
    },
  },
};

export default NextAuth(authOptions);
