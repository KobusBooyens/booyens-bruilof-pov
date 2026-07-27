/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // We render Drive thumbnails with a plain <img loading="lazy">, so Next's
    // image optimizer is left out on purpose (keeps Vercel function usage low).
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};
module.exports = nextConfig;
