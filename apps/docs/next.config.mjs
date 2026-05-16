import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*'],
  async redirects() {
    return [
      { source: '/playground', destination: '/create', permanent: true },
      { source: '/recipes/i18n', destination: '/plugins/next-intl', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
