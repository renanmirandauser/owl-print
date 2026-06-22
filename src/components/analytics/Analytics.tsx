"use client";

import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function Analytics() {
  const GA = process.env.NEXT_PUBLIC_GA_ID;
  const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <>
      {GA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA}');
            `}
          </Script>
        </>
      )}

      {PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

/** Helper para disparar eventos de qualquer Client Component */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  window.fbq?.("trackCustom", event, params);
}
