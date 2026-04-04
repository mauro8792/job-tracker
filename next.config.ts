import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Raíz real del app (evita que Turbopack resuelva deps desde el folder del workspace padre, p. ej. Desktop). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/applications", destination: "/postulaciones", permanent: true },
      { source: "/applications/:id", destination: "/postulaciones/:id", permanent: true },
    ];
  },
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules", "tailwindcss"),
    },
  },
};

export default nextConfig;
