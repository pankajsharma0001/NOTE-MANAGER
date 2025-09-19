import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

// 👇 export authOptions so getServerSession can use the SAME config
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

  secret: process.env.NEXTAUTH_SECRET, // 🔑 must be set in .env.local

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
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl + "/dashboard";
    },
  },
};

export default NextAuth(authOptions);
