// src/pages/_app.js
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "@/styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      {/* ✅ Google AdSense Auto Ads Script */}
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7250272579898318"
        crossOrigin="anonymous"
      />

      <Component {...pageProps} />
      <Analytics />
    </SessionProvider>
  );
}
