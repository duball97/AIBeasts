import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensure Vite builds correctly
  },
  assetsInclude: ["**/*.glb"],
});
