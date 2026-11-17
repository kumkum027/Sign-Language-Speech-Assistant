/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mounting in development for Web Speech & WebCam
  optimizeFonts: false, // Prevents build-time font scraping failures on cloud containers
  webpack: (config, { isServer }) => {
    // Only apply client-side polyfill fallbacks on the browser bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
