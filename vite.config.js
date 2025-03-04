import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  server: {
    allowedHosts: [".ngrok-free.app"],
  },
  plugins: [react()],
  resolve: {},
});
