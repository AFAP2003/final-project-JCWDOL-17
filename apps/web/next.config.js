/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'random-image-pepebigotes.vercel.app',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
