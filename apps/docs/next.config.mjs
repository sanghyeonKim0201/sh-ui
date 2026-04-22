/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*'],
  async redirects() {
    return [
      { source: '/playground', destination: '/create', permanent: true },
    ];
  },
};

export default nextConfig;
