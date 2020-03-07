import React, { useMemo } from 'react'
import { ThemeProvider, createMuiTheme, useMediaQuery } from '@material-ui/core'
import App from './App'

const DARK_PALETTE = {
  type: 'dark',
  primary: {
    main: '#f9dc41'
  },
  secondary: {
    main: '#ff5544'
  },
  listHeaderBackground: 'rgba(64,64,64,0.9)'
}
const LIGHT_PALETTE = {
  type: 'light',
  primary: {
    main: '#212121'
  },
  secondary: {
    main: '#ff5544'
  },
  listHeaderBackground: 'rgba(255,255,255,0.9)'
}

export default function ThemeApp({}) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(() => createMuiTheme({
    palette: prefersDarkMode? DARK_PALETTE : LIGHT_PALETTE,
  }), [prefersDarkMode])

  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  )
}
