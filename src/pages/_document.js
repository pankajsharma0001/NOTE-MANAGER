import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ✅ PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />

        {/* ✅ Icons for homescreen */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/icons/icon-192x192.png" />

        {/* ✅ AdSense (keep existing) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7250272579898318"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <body className="bg-gray-900 text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
