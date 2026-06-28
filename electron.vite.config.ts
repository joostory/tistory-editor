import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import renderer from 'vite-plugin-electron-renderer'
import { resolve, join, extname } from 'path'
import { readdirSync, statSync, readFileSync } from 'fs'

// src/main 하위의 모든 JS/TS 파일을 찾아 개별 엔트리로 매핑하는 함수
function getMainEntries(dir: string, baseDir: string = dir): Record<string, string> {
  const entries: Record<string, string> = {}
  
  function search(currentDir: string) {
    const files = readdirSync(currentDir)
    for (const file of files) {
      const fullPath = join(currentDir, file)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        search(fullPath)
      } else {
        const ext = extname(file)
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
          // src/main 기준의 상대 경로를 키로 설정 (예: 'events/auth')
          const relPath = currentDir.substring(baseDir.length + 1)
          const key = relPath ? join(relPath, file.substring(0, file.length - ext.length)) : file.substring(0, file.length - ext.length)
          entries[key] = fullPath
        }
      }
    }
  }
  
  search(dir)
  return entries
}

const mainEntries = getMainEntries(resolve(__dirname, 'src/main'))
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const externalDeps = Object.keys(pkg.dependencies || {})

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: mainEntries, // 메인 폴더의 모든 소스파일을 각각 개별 컴파일 엔트리로 매핑
        formats: ['cjs']
      },
      rollupOptions: {
        external: ['electron', 'electron-settings', ...externalDeps],
        output: {
          preserveModules: true, // 디렉토리 계층 구조 보존
          entryFileNames: '[name].js' // 원래 확장자 유지
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react(), renderer()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          about: resolve(__dirname, 'src/renderer/about.html')
        }
      }
    },
    esbuild: {
      loader: 'tsx',
      include: /src\/renderer\/.*\.[jt]sx?$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'tsx'
        }
      }
    }
  }
})
