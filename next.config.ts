import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // The founder app must not be framed by other origins. 'self' (not 'none') because srcdoc
    // preview iframes inherit this policy and must stay allowed.
    // Public pages under /p are left embeddable on purpose.
    const noFrame = [{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" }];
    return [
      { source: "/app/:path*", headers: noFrame },
      { source: "/login", headers: noFrame },
    ];
  },
};

export default nextConfig;
