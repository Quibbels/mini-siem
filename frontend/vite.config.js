import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",  // Bind to IPv4 only
    port: 3001,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",  // IPv4
        changeOrigin: true,
        secure: false
      }
    }
  }
});
