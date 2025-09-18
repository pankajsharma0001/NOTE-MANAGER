import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {connectMongo} from "../../../lib/mongodb";
import User from "../../../models/User";

export default NextAuth({
  // Providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Custom login page
  pages: {
    signIn: "/login",
  },

  // Session strategy
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl + "/dashboard";
    },

    async jwt({ token, account, profile }) {
      // When user signs in for the first time
      if (account && profile) {
        await connectMongo();

        let user = await User.findOne({ email: profile.email });

        if (!user) {
          user = await User.create({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          });
        }

        token.userId = user._id.toString();
      }
      return token;
    },

    async session({ session, token }) {
      await connectMongo();

      // Get user from DB
      const user = await User.findOne({ email: session.user.email });

      if (user) {
        session.user.id = user._id.toString();

        // Role
        const adminEmails = ["sharmapankaj102030@gmail.com"]; // add more if needed
        session.user.role = adminEmails.includes(user.email) ? "admin" : "user";

        // Extra fields
        session.user.semester = user.semester || "";
        session.user.college = user.college || "";
        session.user.address = user.address || "";
        session.user.phone = user.phone || "";
      }

      return session;
    },
  },
});
