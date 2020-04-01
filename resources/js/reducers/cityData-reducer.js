const defaultState = {
    cityData: [],
    loading: false,
    errors: {}
}

export default (state = defaultState, action = {}) => {
    switch (action.type) {

        case 'GET_CITYDATA_LOADING': {
            return {
                ...state,
                loading: true,
                errors: {}
            }
        }

        case 'GET_CITYDATA_SUCCESS': {
            return {
                ...state,
                cityData: action.payload.cityData,
                loading: false,
                errors: {}
            }
        }

        default:
            return state
    }
}