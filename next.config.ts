import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["next-mdx-remote"],
  allowedDevOrigins: [],
  devIndicators: false,
  experimental: {
    optimizePackageImports: [
      "motion",
      "radix-ui",
      "@base-ui/react",
      "@visx/shape",
      "@visx/scale",
      "@visx/grid",
      "@visx/event",
      "@visx/curve",
      "@visx/responsive",
      "fumadocs-core",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
    ],
    qualities: [75, 100],
  },
  compiler:
    process.env.NODE_ENV === "production"
      ? {
          removeConsole: {
            exclude: ["error"],
          },
        }
      : undefined,
  async headers() {
    return [
      {
        source: "/(tech-stack-icons|icons)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=604800, s-maxage=31536000, stale-while-revalidate=31536000",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=31536000",
          },
        ],
      },
      {
        source:
          "/(yugesh-avatar\\.webp|yugesh-name\\.mp3|og\\.png|og-light\\.png)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=31536000",
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/stats",
        destination: "/#stats",
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/blog/:slug.mdx",
        destination: "/doc.mdx/:slug",
      },
      {
        source: "/blog/:slug",
        destination: "/doc.mdx/:slug",
        has: [
          {
            type: "header",
            key: "accept",
            value: "(?<accept>.*text/markdown.*)",
          },
        ],
      },
      {
        source: "/rss",
        destination: "/blog/rss",
      },
    ]
  },
}

export default nextConfig
