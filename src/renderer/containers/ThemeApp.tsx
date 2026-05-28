import React, { useMemo, useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { HashRouter } from 'react-router-dom'
import * as AppTheme from '../constants/AppTheme'
import App from './App'
import { useAtomValue } from 'jotai'
import { preferencesState } from '../state/preferences'
import { Preferences } from '../types'

const CONTENT_PALETTE = {
  background: '#fff',
  text: '#333',
  divider: 'rgba(0, 0, 0, 0.12)',
  tagBorder: 'rgba(0, 0, 0, 0.23)',
  maxWidth: 700
}

const EDITOR_PALETTE = {
  toolbar: {
    background: 'rgba(200,200,200,0.9)'
  }
}

const DARK_PALETTE = {
  mode: 'dark' as const,
  primary: {
    main: '#f9dc41'
  },
  secondary: {
    main: '#ff5544'
  },
  headerBackground: 'rgba(64,64,64,0.9)',
  content: CONTENT_PALETTE,
  editor: EDITOR_PALETTE,
}

const LIGHT_PALETTE = {
  mode: 'light' as const,
  primary: {
    main: '#212121'
  },
  secondary: {
    main: '#ff5544'
  },
  headerBackground: 'rgba(255,255,255,0.9)',
  content: CONTENT_PALETTE,
  editor: EDITOR_PALETTE,
}

export default function ThemeApp() {
  const preferences = useAtomValue(preferencesState) as Preferences
  const [shouldUseDarkColors, setShouldUseDarkColors] = useState<boolean>(false)

  useEffect(() => {
    // 초기 시스템 다크모드 설정값 조회
    ipcRenderer.invoke('get-native-theme-dark-mode')
      .then((isDark: boolean) => {
        setShouldUseDarkColors(isDark)
      })
      .catch((err) => {
        console.error('Failed to get native theme dark mode', err)
      })

    const handleThemeUpdate = (_e: any, isDark: boolean) => {
      setShouldUseDarkColors(isDark)
    }

    ipcRenderer.on('native-theme-updated', handleThemeUpdate)
    return () => {
      ipcRenderer.removeListener('native-theme-updated', handleThemeUpdate)
    }
  }, [])

  const theme = useMemo(() => {
    const appTheme = preferences.appTheme || AppTheme.SYSTEM
    const prefersDarkMode = appTheme === AppTheme.SYSTEM ? shouldUseDarkColors : appTheme === AppTheme.DARK
    return createTheme({
      palette: prefersDarkMode ? DARK_PALETTE : LIGHT_PALETTE,
    })    
  }, [preferences, shouldUseDarkColors])

  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  )
}
