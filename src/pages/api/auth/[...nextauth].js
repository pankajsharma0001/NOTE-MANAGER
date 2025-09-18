import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Custom pages (optional)
  pages: {
    signIn: "/login", // your custom login page
  },

  // Session settings
  session: {
    strategy: "jwt",
  },

  // Callbacks
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to /dashboard after login
      return baseUrl + "/dashboard";
    },

    async session({ session, token }) {
      // Define which email(s) should be admin
      const adminEmails = ["sharmapankaj102030@gmail.com"]; // <-- replace with your email(s)

      session.user.id = token.sub;
      session.user.role = adminEmails.includes(session.user.email) ? "admin" : "user";

      return session;
    },
  },
});
