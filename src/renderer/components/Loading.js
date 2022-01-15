import React from 'react'
import { CircularProgress, Backdrop } from '@mui/material'

export default function Loading() {
  return (
    <Backdrop sx={{zIndex: 15}} open={true}>
      <CircularProgress size={60} thickness={7} />
    </Backdrop>
  )
}
