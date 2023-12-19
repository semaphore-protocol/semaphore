/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "semaphore.cedoor.dev"
            }
        ]
    }
}

module.exports = nextConfig
