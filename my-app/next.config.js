/** @type {import('next').NextConfig} */

// Add the code here to disable the bufferutil and utf-8-validate
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      bufferutil: false,
      "utf-8-validate": false,
    };
    return config;
  },
};

module.exports = nextConfig;
