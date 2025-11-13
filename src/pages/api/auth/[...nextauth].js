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
  },

  // Remove custom cookie configuration - let NextAuth handle it
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account, profile }) {
      // Only connect to DB for initial sign-in
      if (account && profile) {
        await connectMongo();

        let user = await User.findOne({ email: profile.email });

        if (!user) {
          user = await User.create({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          });
        } else {
          user.loginCount = (user.loginCount || 0) + 1;
          await user.save();
        }

        token.sub = user._id.toString(); // Use 'sub' like Typing Game
      }

      return token;
    },

    // FIXED: Always fetch fresh data from database like Typing Game
    async session({ session, token }) {
      if (token?.sub) {
        await connectMongo();
        const user = await User.findById(token.sub).lean();
        
        if (user) {
          session.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: ["sharmapankaj102030@gmail.com"].includes(user.email) ? "admin" : "user",
            semester: user.semester || "",
            college: user.college || "",
            address: user.address || "",
            phone: user.phone || "",
            loginCount: user.loginCount || 0,
            lastReadNote: user.lastReadNote || null,
            lastReadAt: user.lastReadAt || null,
            profileComplete: user.profileComplete || false,
          };
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
  },

  trustHost: true,
};

export default NextAuth(authOptions);