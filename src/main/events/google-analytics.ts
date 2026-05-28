import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

const MEASUREMENT_ID = 'G-X55F50L3GM'
// GA4 Measurement Protocol에서는 API_SECRET이 필수가 아닐 수도 있으나,
// 보안 수집 처리를 활성화하거나 기본 Payload 전송을 위해 빈 스트링 또는 임의 값을 지원합니다.
const API_SECRET = '' 

const clientID = uuidv4()

// GA4 Measurement Protocol을 사용해 이벤트를 직접 발송하는 헬퍼 함수
async function sendGA4Event(eventName: string, params: Record<string, any>): Promise<void> {
  const url = API_SECRET 
    ? `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`
    : `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}`

  const payload = {
    client_id: clientID,
    events: [
      {
        name: eventName,
        params: {
          engagement_time_msec: '100',
          ...params
        }
      }
    ]
  }

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log(`GA4_SUCCESS [${eventName}]:`, response.status)
  } catch (error: any) {
    console.error(`GA4_FAILED [${eventName}]:`, error?.message || error)
  }
}

export default function initGoogleAnalytics(): void {
  // PageView 이벤트 수집 리스너
  ipcMain.on('ga-pageview', (_evt, page: string, title: string) => {
    console.log('GA_PAGEVIEW', page, title)
    
    // GA4에서는 page_view가 공식 권장 이벤트 포맷입니다.
    sendGA4Event('page_view', {
      page_path: page,
      page_title: title,
      page_location: `app://tistory-editor${page}`
    })
  })

  // 에러/예외 이벤트 수집 리스너
  ipcMain.on('ga-exception', (_evt, description: string, fatal: boolean) => {
    console.error('GA_EXCEPTION', description, fatal)
    
    sendGA4Event('exception', {
      description: description,
      fatal: fatal ? 1 : 0
    })
  })

  // 메인 프로세스 전역 미처리 예외(Crash) 수집 체계 구축
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception in Main Process:', error)
    sendGA4Event('exception', {
      description: `[Main] ${error?.message || 'Unknown error'}\nStack: ${error?.stack?.substring(0, 150) || ''}`,
      fatal: 1
    })
  })

  process.on('unhandledRejection', (reason: any) => {
    console.error('Unhandled Rejection in Main Process:', reason)
    const errMsg = reason instanceof Error ? reason.message : String(reason)
    const errStack = reason instanceof Error ? reason.stack?.substring(0, 150) : ''
    sendGA4Event('exception', {
      description: `[Main Rejection] ${errMsg}\nStack: ${errStack}`,
      fatal: 0
    })
  })
}
