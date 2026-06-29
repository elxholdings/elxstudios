/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.elxholdings.com' }],
        destination: 'https://elxholdings.com/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
