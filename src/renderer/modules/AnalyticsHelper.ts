import { ipcRenderer } from 'electron'

export function pageview(page: string, pageTitle: string): void {
  console.log('GA-PageView', page, pageTitle)
  ipcRenderer.send('ga-pageview', page, pageTitle)
}

// 렌더러 프로세스에서 발생하는 예외를 GA4로 수집하는 함수
export function trackException(error: Error, fatal = false): void {
  const description = `[Renderer] ${error.message}\nStack: ${error.stack?.substring(0, 150) || ''}`
  console.error('GA-Exception Tracked:', description)
  ipcRenderer.send('ga-exception', description, fatal)
}

// 렌더러 프로세스 전역 미처리 예외(Unhandled Exception / Rejection) 자동 리스너 등록
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    trackException(event.error || new Error(event.message), true)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const error = reason instanceof Error ? reason : new Error(String(reason))
    trackException(error, false)
  })
}
