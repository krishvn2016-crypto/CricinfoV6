
📝 Update frontend/app/+html.tsx
Open: https://github.com/krishvn2016-crypto/CricinfoV6/blob/main/frontend/app/+html.tsx
✏️ Edit → Ctrl+A → Delete.
Copy the code below (start from // @ts-nocheck, end at the last }).
⬇️ Copy starts here:

// @ts-nocheck
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const GTM_ID = "GTM-M3W3JV2T";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* SEO meta tags */}
        <title>CrickInfo — Live Cricket Scores, Stats & AI Insights</title>
        <meta name="description" content="Live cricket scores, ball-by-ball commentary, deep player and team analytics, fantasy tips, and AI-powered insights for IPL, T20 World Cup and more." />
        <meta name="keywords" content="cricket, live score, IPL 2026, T20 World Cup, ball by ball, fantasy cricket, player stats, AI cricket assistant" />

        {/* Open Graph (WhatsApp / Twitter / FB link previews) */}
        <meta property="og:title" content="CrickInfo — Live Cricket Scores & Insights" />
        <meta property="og:description" content="Every ball. Every stat. Live." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cricknet.netlify.app/" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Google Search Console verification — replace VERIFY_TOKEN_HERE when ready */}
        {/* <meta name="google-site-verification" content="VERIFY_TOKEN_HERE" /> */}

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        {/* End Google Tag Manager */}

        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body > div:first-child { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; }
              [role="tablist"] [role="tab"] * { overflow: visible !important; }
              [role="heading"], [role="heading"] * { overflow: visible !important; }
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        {/* End Google Tag Manager (noscript) */}

        {children}
      </body>
    </html>
  );
}
