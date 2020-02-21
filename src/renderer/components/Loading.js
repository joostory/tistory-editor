import React from 'react'
import { CircularProgress, Backdrop, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: 15
  }
}))

export default function Loading() {
  const classes = useStyles()
  return (
    <Backdrop open={true} className={classes.root}>
      <CircularProgress size={60} thickness={7} />
    </Backdrop>
  )
}
