import {createStore, applyMiddleware} from 'redux'
import promise from 'redux-promise-middleware'
import thunk from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import allReducers from './reducers'

const store = createStore(
    allReducers,
    composeWithDevTools(applyMiddleware(promise(), thunk))
)

export default store