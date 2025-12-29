import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'deploy/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
      ],
    },
    build: {
      // Optimize for client-side operation and performance
      target: 'es2015', // Support modern browsers for better performance
      minify: 'terser', // Use terser for better compression
      sourcemap: mode === 'development', // Only include sourcemaps in development
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['./src/utils/PerformanceMonitor.ts', './src/utils/ErrorHandler.ts'],
          },
          // Optimize asset naming for CDN caching with content hashing
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      // Optimize bundle size for AWS S3 and CloudFront
      chunkSizeWarningLimit: 500, // Warn for chunks larger than 500KB for better CDN performance
      assetsInlineLimit: 4096, // Inline assets smaller than 4KB
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize for production deployment
      reportCompressedSize: true,
      // Ensure clean build directory
      emptyOutDir: true,
    },
    // Production optimizations
    server: {
      // Enable compression during development
      middlewareMode: false,
    },
    // Environment-specific configuration
    define: {
      // Ensure we're building for client-side only
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      'import.meta.env.SSR': false,
    },
    // Optimize CSS for production
    css: {
      devSourcemap: mode === 'development',
      preprocessorOptions: {
        // Optimize CSS processing for production
      },
    },
    // Base URL configuration for CDN deployment
    base: mode === 'production' ? env.VITE_CDN_BASE_URL || '/' : '/',
  }
})