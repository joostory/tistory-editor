import React, { useMemo, useState } from 'react'
import { nativeTheme } from '@electron/remote'
import { useSelector } from 'react-redux'
import { ThemeProvider, createTheme } from '@material-ui/core'
import * as AppTheme from '../constants/AppTheme'
import App from './App'

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
  type: 'dark',
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
  type: 'light',
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

export default function ThemeApp({}) {
  const preferences = useSelector(state => state.preferences)
  const [shouldUseDarkColors, setShouldUseDarkColors] = useState(nativeTheme.shouldUseDarkColors)
  const theme = useMemo(() => {
    const appTheme = preferences.appTheme || AppTheme.SYSTEM
    const prefersDarkMode = appTheme == AppTheme.SYSTEM? shouldUseDarkColors : appTheme == AppTheme.DARK
    return createTheme({
      palette: prefersDarkMode? DARK_PALETTE : LIGHT_PALETTE,
    })    
  }, [preferences, shouldUseDarkColors])

  nativeTheme.on('updated', () => {
    setShouldUseDarkColors(nativeTheme.shouldUseDarkColors)
  })

  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  )
}
