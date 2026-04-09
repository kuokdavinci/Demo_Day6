/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true
  },
  devIndicators: {
    appIsrStatus: false
  },
  // Cho phép tunnel/network access trong lúc dev
  allowedDevOrigins: ["26.49.42.89", "*.pinggy.link", "*.trycloudflare.com", "*.loca.lt", "*.lhr.life"]
};

export default nextConfig;
