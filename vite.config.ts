import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      tailwindcss(),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': [
              'useMessage',
              'useNotification',
              'useDialog',
              'useLoadingBar',
            ],
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/date-fns')) {
              return 'date-fns-vendor'
            }
            if (id.includes('node_modules/naive-ui')) {
              return 'naive-ui-vendor'
            }
            if (id.includes('node_modules/@vicons')) {
              return 'icons-vendor'
            }
            if (id.includes('node_modules/three')) {
              return 'three-vendor'
            }
          }
        }
      }
    }
  }
})
