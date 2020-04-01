import {getLocalVal} from '../constants/utilities'

export default function authHeader() {
    // return authorization header with basic auth credentials
    let user = getLocalVal('user', {})

    if (user && user.authdata) {
        return { 'Authorization': 'Basic ' + user.authdata }
    } else {
        return {}
    }
}