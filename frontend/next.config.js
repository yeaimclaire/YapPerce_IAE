/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:4001/graphql',
    NEXT_PUBLIC_PRODUCT_SERVICE_URL: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:4002/graphql',
    NEXT_PUBLIC_ORDER_SERVICE_URL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:4003/graphql',
    NEXT_PUBLIC_PAYMENT_SERVICE_URL: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:4004/graphql',
  }
}

module.exports = nextConfig

