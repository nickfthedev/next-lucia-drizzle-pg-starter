/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./customImageLoader.ts",
  },
};

export default nextConfig;
