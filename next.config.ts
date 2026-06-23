import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Monorepo-style lockfiles above this folder make Next pick the wrong root → 404 on /
  output: "standalone",
  turbopack: {
    root: projectRoot,
  },
};

export default withNextIntl(nextConfig);
