// src/pages/_app.js
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gets focus
    >
      <Component {...pageProps} />
      <Analytics />
    </SessionProvider>
  );
}
