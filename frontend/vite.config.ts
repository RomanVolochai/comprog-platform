import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export default defineConfig({
  plugins: [
    react(),
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    })
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://web:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@mdx-js/react', 'katex', 'react-katex']
  }
})

