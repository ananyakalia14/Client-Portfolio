import { defineConfig } from "vite";
import { publicDir, snapshotPlugin } from "./src/snapshot.mjs";

export default defineConfig({
  appType: "mpa",
  publicDir,
  build: {
    outDir: "dist/client",
  },
  server: {
    host: "127.0.0.1",
    port: 4175,
    strictPort: true,
    allowedHosts: ["terminal.local"],
    hmr: false,
  },
  plugins: [snapshotPlugin()],
});

