import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'

import {
  Dialog, Button, DialogTitle, DialogContent, DialogActions, Box, Typography, Paper
} from '@mui/material'

import {
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  SettingsBrightness as SystemIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

import * as AppTheme from '#/renderer/constants/AppTheme'
import { useAtomValue } from 'jotai'
import { preferencesState } from '#/renderer/state/preferences'

export default function Preference() {
  const [open, setOpen] = useState<boolean>(false)
  const preferences = useAtomValue(preferencesState)
  const appTheme = preferences.appTheme || AppTheme.SYSTEM

  function handlePreferenceOpen() {
    setOpen(true)
  }

  function handlePreferenceClose() {
    setOpen(false)
  }

  function handleChangeAppTheme(themeValue: string) {
    ipcRenderer.send("save-preferences", Object.assign({}, preferences, {
      appTheme: themeValue
    }))
  }

  useEffect(() => {
    ipcRenderer.on("open-preference", handlePreferenceOpen)

    return () => {
      ipcRenderer.removeListener("open-preference", handlePreferenceOpen)  
    }
  }, [])

  const themeOptions = [
    {
      value: AppTheme.SYSTEM,
      label: '시스템 설정',
      description: 'OS 환경에 맞춰 자동 전환',
      icon: <SystemIcon sx={{ fontSize: 32, mb: 1, color: 'text.secondary' }} />
    },
    {
      value: AppTheme.LIGHT,
      label: '라이트 모드',
      description: '눈이 밝고 화사한 화면',
      icon: <LightIcon sx={{ fontSize: 32, mb: 1, color: '#f59e0b' }} />
    },
    {
      value: AppTheme.DARK,
      label: '다크 모드',
      description: '편안하고 아늑한 화면',
      icon: <DarkIcon sx={{ fontSize: 32, mb: 1, color: '#3b82f6' }} />
    }
  ]

  return (
    <Dialog 
      open={open} 
      onClose={handlePreferenceClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          padding: 1,
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: '1.25rem' }}>환경설정</DialogTitle>

      <DialogContent>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2, fontWeight: 500 }}>
          테마 선택
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          {themeOptions.map((option) => {
            const isSelected = appTheme === option.value
            return (
              <Paper
                key={option.value}
                onClick={() => handleChangeAppTheme(option.value)}
                elevation={isSelected ? 2 : 0}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 3,
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                  position: 'relative',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px -10px rgba(0,0,0,0.12)',
                    borderColor: isSelected ? 'primary.main' : 'primary.light',
                  }
                }}
              >
                {option.icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
                  {option.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
                  {option.description}
                </Typography>
                {isSelected && (
                  <CheckCircleIcon 
                    color="primary" 
                    sx={{ 
                      position: 'absolute', 
                      right: 12, 
                      top: 12,
                      fontSize: 20
                    }} 
                  />
                )}
              </Paper>
            )
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          variant='contained' 
          disableElevation
          onClick={handlePreferenceClose}
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  )
}
