import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const sourceProject = process.argv[2];
if (!sourceProject) throw new Error("Pass the MicroSlats_AsciiKoi project folder.");
const project = fileURLToPath(new URL("..", import.meta.url));
const entryDir = join(project, "src", "koi-background");
const components = join(entryDir, "components");
await mkdir(components, { recursive: true });
await Promise.all([
  cp(join(sourceProject, "components", "MicroSlats.jsx"), join(components, "MicroSlats.jsx")),
  cp(join(sourceProject, "components", "MicroSlats.css"), join(components, "MicroSlats.css")),
  cp(join(sourceProject, "components", "ascii-animals"), join(components, "ascii-animals"), { recursive: true }),
]);
await build({
  entryPoints: [join(entryDir, "entry.jsx")],
  bundle: true,
  minify: true,
  platform: "browser",
  format: "esm",
  target: "es2020",
  jsx: "automatic",
  nodePaths: [join(sourceProject, "node_modules")],
  alias: {
    react: join(sourceProject, "node_modules", "react"),
    "react-dom": join(sourceProject, "node_modules", "react-dom"),
  },
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".css": "empty" },
  outfile: join(project, "snapshot", "assets", "raj", "koi-background.js"),
  logLevel: "info",
});
