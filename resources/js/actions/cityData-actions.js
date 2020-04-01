import {getLocalVal} from "../constants/utilities"

export function saveCityData(cityData) {
    return dispatch => {
        return dispatch({
            type: 'FETCH_CITYDATA_FULFILLED',
            payload: cityData
        })
    }
}

export function fetchAllCityData() {
    return dispatch => {
        dispatch({
            type: 'GET_CITYDATA_LOADING',
            payload: true
        })

        dispatch({
            type: 'GET_CITYDATA_SUCCESS',
            payload: getLocalVal('cityDataArr', [])
        })
    }
}

/*


export function updateCityData(issue) {
    return dispatch => {
        return dispatch({
            type: 'UPDATE_CITYDATA',
            payload: doRequest.put(`${url}/${issue._id}`, issue)
        })
    }
}

export function deleteCityData(_id) {
    return dispatch => {
        return dispatch({
            type: 'DELETE_CITYDATA',
            payload: doRequest.delete(`${url}/${_id}`)
        })
    }
}*/
