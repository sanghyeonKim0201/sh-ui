/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*'],
  async redirects() {
    return [
      { source: '/playground', destination: '/create', permanent: true },
      { source: '/recipes/auth', destination: '/plugins/auth-jwt', permanent: true },
      { source: '/recipes/sentry', destination: '/plugins/sentry', permanent: true },
      { source: '/recipes/i18n', destination: '/plugins/next-intl', permanent: true },
    ];
  },
};

export default nextConfig;
