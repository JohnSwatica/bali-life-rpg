import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      phaser: "/Users/z/包包/bali-life-rpg/src/test/phaserStub.ts"
    }
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
