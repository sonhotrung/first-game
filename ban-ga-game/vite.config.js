import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Ép Vite chuyển các file ảnh/âm thanh nhỏ hơn 4KB thành dạng Base64
    // Nằm thẳng trong file JS để giảm số lượng HTTP Requests
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        // Tách file JS (Chunking) để trình duyệt Cache tốt hơn
        manualChunks: (id) => {
          // Tách riêng thư viện React (ít khi đổi)
          if (id.includes("node_modules/react")) {
            return "vendor_react";
          }
          // Tách riêng Core Logic của Game thành 1 file riêng biệt
          if (id.includes("/src/entities/") || id.includes("/src/constants/")) {
            return "game_engine_core";
          }
        },
      },
    },
  },
});
