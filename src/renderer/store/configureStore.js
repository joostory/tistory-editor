import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import rootReducer from '../reducers'

export default () => {
  return configureStore({
    reducer: rootReducer,
    middleware: [logger]
  })
}
