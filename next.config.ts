import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' https://${supabaseHost} wss://${supabaseHost};
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  // ── Anti-clickjacking ──────────────────────────────────────────────
  { key: "X-Frame-Options", value: "DENY" },
  // ── MIME-type sniffing ─────────────────────────────────────────────
  { key: "X-Content-Type-Options", value: "nosniff" },
  // ── Content Security Policy ────────────────────────────────────────
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  // ── Referrer leakage ──────────────────────────────────────────────
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // ── Feature / Permissions policy ──────────────────────────────────
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // ── HSTS (enable once HTTPS is confirmed) ─────────────────────────
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // ── Cross-domain: restrict CORS to same origin ────────────────────
  { key: "Access-Control-Allow-Origin", value: "same-origin" },
  { key: "Access-Control-Allow-Methods", value: "GET, POST" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, x-csrf-token" },
  // ── XSS Protection (legacy browsers) ─────────────────────────────
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // No caching on auth and API routes to prevent "Retrieved from Cache"
        source: '/(login|register|forgot-password|reset-password|api/:path*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
