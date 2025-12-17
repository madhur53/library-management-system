import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Adjust these targets if your backend ports differ in your environment.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // .NET user-service
      "^/api/users": {
        target: "http://localhost:5041",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/users/, "/api/users")
      },
      "^/api/admins": {
        target: "http://localhost:5041",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/admins/, "/api/admins")
      },
      "^/api/members": {
        target: "http://localhost:5041",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/members/, "/api/members")
      },

      // Spring Boot catalog
      "^/api/catalog": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/catalog/, "/api/catalog")
      }
    }
  }
});
