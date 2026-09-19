import "@/styles/globals.css"

import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { WebSite, WithContext } from "schema-dts"

import {
  META_THEME_COLORS,
  SHARE_IMAGES,
  SITE_INFO,
  X_HANDLE,
} from "@/config/site"
import { fontVariables } from "@/lib/fonts"
import { Providers } from "@/components/providers"
import { USER } from "@/features/portfolio/data/user"

function getWebSiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_INFO.name,
    url: SITE_INFO.url,
    alternateName: [USER.username],
  }
}

// Thanks @shadcn-ui, @tailwindcss
const darkModeScript = String.raw`
  try {
    if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
    }
  } catch (_) {}

  try {
    if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
      document.documentElement.classList.add('os-macos')
    }
  } catch (_) {}
`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  title: {
    template: `%s – ${SITE_INFO.name}`,
    default: `${USER.displayName} – ${USER.jobTitle}`,
  },
  description: SITE_INFO.description,
  keywords: SITE_INFO.keywords,
  authors: [
    {
      name: USER.displayName,
      url: SITE_INFO.url,
    },
  ],
  creator: USER.displayName,
  openGraph: {
    siteName: SITE_INFO.name,
    url: "/",
    type: "profile",
    locale: "en_US",
    firstName: USER.firstName,
    lastName: USER.lastName,
    username: USER.username,
    gender: USER.gender,
    images: [...SHARE_IMAGES],
  },
  twitter: {
    card: "summary_large_image",
    site: X_HANDLE,
    creator: X_HANDLE,
    images: [...SHARE_IMAGES],
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.svg",
        sizes: "any",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      type: "image/png",
      sizes: "180x180",
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: META_THEME_COLORS.light,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/*
          This site ships its own dark theme, so the Dark Reader extension has
          nothing to add. Left enabled it rewrites every SVG `stroke`/`fill`
          into `--darkreader-inline-*` custom properties before React hydrates,
          which fights our theme and throws a hydration mismatch on every route.
          `darkreader-lock` is Dark Reader's documented opt-out.
        */}
        <meta name="darkreader-lock" />

        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: darkModeScript }}
        />
        {/*
          Thanks @tailwindcss. We inject the script via the `<Script/>` tag again,
          since we found the regular `<script>` tag to not execute when rendering a not-found page.
         */}
        <Script src={`data:text/javascript;base64,${btoa(darkModeScript)}`} />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var value = localStorage.getItem('avatarLights');
                document.documentElement.dataset.avatarLights = JSON.parse(value || '"on"');
              } catch(_) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebSiteJsonLd()).replace(/</g, "\\u003c"),
          }}
        />
      </head>

      <body>
        <Providers>
          <NuqsAdapter>{children}</NuqsAdapter>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
