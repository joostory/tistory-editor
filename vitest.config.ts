import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // src 디렉토리 아래의 원래 TS 테스트 코드 파일만 대상으로 직접 실행
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.test.tsx', 'src/**/*.spec.tsx'],
  },
  resolve: {
    alias: {
      '#': resolve(__dirname, './src')
    }
  }
})
