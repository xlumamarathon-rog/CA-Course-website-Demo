/** @type {import('next').NextConfig} */
const nextConfig = {
  // Course pages are resolved at runtime from device storage, so any course
  // created in the admin panel gets a working URL immediately.
  // That needs a Next server (`npm run dev` / `npm run build && npm start`)
  // rather than a static export.
  images: { unoptimized: true }
};
export default nextConfig;
