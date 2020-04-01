import {combineReducers} from 'redux'
import cityDataReducer from './cityData-reducer'

export default combineReducers({
    cityDataStore: cityDataReducer
})