import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import nodePolyfills from 'rollup-plugin-polyfill-node';


export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  server: {
    host: '0.0.0.0', // Exposes the server to all network interfaces
    port: 4173, // Specify the port you want to use
  },
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer'
    },
  },
})
