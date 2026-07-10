import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";

function getBuildStamp(): string {
  try {
    const shortHash = execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
    const buildDate = new Date().toISOString().slice(0, 10);
    return `${shortHash} · ${buildDate}`;
  } catch {
    return "dev";
  }
}

export default defineConfig({
  define: {
    __BALI_LIFE_BUILD_STAMP__: JSON.stringify(getBuildStamp())
  },
  server: {
    port: 5173,
    strictPort: false
  }
});
