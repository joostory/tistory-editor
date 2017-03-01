import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'

export default (preloadedState) => {
  if (process.env.NODE_ENV !== 'production') {
    return createStore(
      rootReducer,
      compose(
        applyMiddleware(thunk, createLogger())
      )
    )
  } else {
    return createStore(
      rootReducer,
      compose(
        applyMiddleware(thunk)
      )
    )
  }
}
