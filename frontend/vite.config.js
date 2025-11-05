import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Chuyển tiếp tất cả các yêu cầu bắt đầu bằng /api đến backend server
      '/api': {
        target: import.meta.env.VITE_API_URL, // QUAN TRỌNG: Đảm bảo đây là cổng backend của bạn
        changeOrigin: true,
        secure: false,
      },
    },
  },
})