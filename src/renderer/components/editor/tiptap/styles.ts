import { createTheme } from '@mui/material/styles'
import { SxProps, Theme } from '@mui/material'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  } as SxProps<Theme>,
  toolbar: {
    position: 'fixed',
    top: 15,
    width: 700,
    display: 'flex',
    alignItems: 'center',
    borderRadius: (theme) => theme.spacing(1),
    paddingLeft: (theme) => theme.spacing(0.5),
    height: (theme) => theme.spacing(5),
    left: '50%',
    transform: 'translate(calc(-50% - 6px),0)',
    zIndex: 10,
    background: '#fffc',
    boxShadow: (theme) => theme.shadows[1],
  } as SxProps<Theme>,
  editorContent: {
    flex: 1,
    backgroundColor: '#fff',
    color: '#333',
    '& .ProseMirror': {
      outline: 'none',
      minHeight: '500px',
      padding: '0px !important',
    },
  } as SxProps<Theme>,
  toolbarBtn: {
    border: '0 !important',
    borderRadius: '4px !important',
    margin: '0 2px',
    padding: '5px',
    minWidth: '34px',
    height: '34px',
    color: '#555',
    '&.Mui-selected': {
      backgroundColor: 'rgba(0, 0, 0, 0.08) !important',
      color: '#000',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.12) !important',
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
    }
  } as SxProps<Theme>
}
