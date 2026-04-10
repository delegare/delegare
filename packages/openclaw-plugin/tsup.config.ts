import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  clean: true,
  dts: true,
  noExternal: [
    // Bundle the sdk and typebox into the final plugin file
    // so OpenClaw doesn't need to install them at runtime.
    "@delegare/sdk",
    "@sinclair/typebox",
  ],
  external: [
    // Leave the OpenClaw SDK external since the host provides it
    "openclaw/plugin-sdk",
    "openclaw/plugin-sdk/plugin-entry",
  ],
});
