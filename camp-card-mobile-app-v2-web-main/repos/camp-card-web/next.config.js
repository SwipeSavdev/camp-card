/** @type {import('next').NextConfig} */
const nextConfig = {
 reactStrictMode: true,
 images: {
 domains: ['campcard-uploads-prod.s3.amazonaws.com'],
 },
 env: {
 NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
 },
 eslint: {
 // Disable ESLint during build to allow styled-component patterns
 ignoreDuringBuilds: true,
 },
};

module.exports = nextConfig;
