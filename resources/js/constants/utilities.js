import React from 'react'
import moment from 'moment'
import momentTz from 'moment-timezone'
import {Col, Icon, notification} from "antd"


/************ DATETIME  *************/
/**================================**/

export const momentTzFormat = (dateTime, tz = 'Europe/Rome', format) => {
    return moment.tz(dateTime ? dateTime : moment(), tz).format(format)
}

export const getCityCurrentTime = (tz) => {
    return momentTzFormat(null, tz, 'HH:mm')
}

export const getTimeDiffFromOriginCity = (originCityTz, openedCityTz) => {
    if (originCityTz === openedCityTz) return 0

    let timeOriginCity = momentTzFormat(null, originCityTz, 'Z').substr(0, 3)
    let timeOpenedCity = momentTzFormat(null, openedCityTz, 'Z').substr(0, 3)
    let timeOpenedCitySign = momentTzFormat(null, openedCityTz, 'Z').substr(0, 1)

    let result = parseInt(timeOpenedCity) - parseInt(timeOriginCity)
    return timeOpenedCitySign === '-' ? result : `+${result}`
}

export const getFirebaseDate = (sec, format) => {
    return moment.unix(sec).format(format)
}


/************ GENERIC *************/
/**==============================**/

export const getPoiCatFormatted = (poi) => {
    return poi.split('_').join(' ').replace(/^\w/, c => c.toUpperCase())
}

export const callApi = async (params, method, headers, url, isJson = true) => {
    const formBody = params && Object.keys(params).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&')

    const settings =
        method === "POST" ? {
            method: method,
            headers: headers,
            body: formBody
        } : {
            method: method,
            headers: headers
        }
    try {
        let getUrl = params ? `${url}?${formBody}` : url

        //console.log(getUrl)

        const fetchResponse = await fetch(getUrl, settings)
        return await isJson ? fetchResponse.json() : fetchResponse.text()
    } catch (e) {
        return e
    }
}

export const getAuthCode = async (url) => {
    const response = await fetch(url)
    const respText = await response.text()
    return respText
}

export const camelCaseToHumanReadeable = (str) => {
    const result = str.replace( /([A-Z])/g, " $1" );
    return result.charAt(0).toUpperCase() + result.slice(1);
}

export const stripeHtml = (htmlStr) => {
    return htmlStr.replace(/<[^>]+>/g, '')
}

export const _renderSection = (icon, title, data) => {
    return (
        <Col>
            <div className="mrgn-b-10 vert-align-ctr">
                <Icon type={icon} className="fs20 mrgn-r-5"/>
                <span className="fs17 bold">{title}</span>
            </div>
            {data}
        </Col>
    )
}

/**
 * Show notification with action result
 * @private
 */
export const showNotification = (title, text, type) => {
    notification[type]({
        message: title,
        description: text,
        placement: 'bottomLeft',
        //duration: 5,
        /*style: {
            backgroundColor: 'rgba(249,127,127,0.8)'
        }*/
    })
}

export const getLocalVal = (key, defaultValue, jsonType = true) => {
    const item = window.localStorage.getItem(key)

    if (item && item !== '')
        return jsonType ? JSON.parse(item) : item
    else
        return defaultValue
}

export const dateFormat = (key) => {
    return getLocalVal('dateFormats', {})[key]
}


/************ TEMPERATURE *************/
/**==================================**/


/**
 * Convert Celsius grades to Farhenheit
 * @param temp
 * @returns {number}
 */
export const celsiusToFarhenheit = (temp) => {
    // (0 °C × 9/5) + 32 = 32°F
    const newTemp = (temp * 9/5) + 32
    return parseInt(newTemp)
}

/**
 * Returns temperature unit basing on settings
 * @returns {string}
 */
export const tempUnit = () => {
    const tempUnit = JSON.parse(window.localStorage.getItem('tempUnit'))
    return tempUnit ? 'C' : 'F'
}

/**
 * Returns temperature value converted
 * @param temp
 * @returns {number}
 */
export const temperatureToShow = (temp) => {
    const tempUnit = JSON.parse(window.localStorage.getItem('tempUnit'))
    return !tempUnit ? celsiusToFarhenheit(temp) : parseInt(temp)
}


/************ DISTANCE *************/
/**===============================**/

/**
 * Convert Kilometers to Miles
 * @param distance
 * @returns {number}
 */
export const kmToMiles = (distance) => {
    // 1 KM / 1609 = 0,000621371 miles
    const newDist = distance / 1609
    return parseInt(newDist)
}

/**
 * Returns distance unit basing on settings
 * @returns {string}
 */
export const distanceUnit = () => {
    const distanceUnit = JSON.parse(window.localStorage.getItem('distanceUnit'))
    return distanceUnit ? 'km' : 'miles'
}

/**
 * Returns distance value converted
 * @returns {number}
 */
export const distanceToShow = (distance) => {
    const distanceUnit = JSON.parse(window.localStorage.getItem('distanceUnit'))
    return !distanceUnit ? kmToMiles(distance) : parseInt(distance)
}

/**
 * Convert 3-letter currency format to symbol
 * @param currencyTo
 * @returns {Promise<string>}
 * @private
 */
export const _convertCurrencyTextToSymbol = async (currencyTo) => {
    let currency = ''
    switch (currencyTo) {
        case 'USD' :
            currency = '$'
            break
        case 'EUR' :
            currency = '€'
            break
        case 'RUB' :
            currency = '₽'
            break
    }
    return currency
}

/************ HOTELS *************/
/**=============================**/

/*export const creditCard2CharsToText = (chars) => {
    let result
    switch (chars) {
        case 'TP':
            result = 'Air Travel Card UATP'
            break
        case 'AX':
            result = 'American Express'
            break
        case 'CB':
            result = 'Carte Blanche'
            break
        case 'DC':
            result = 'Diners Club'
            break
        case 'DS':
            result = 'Discover Card'
            break
        case 'CA':
            result = 'MasterCard'
            break
        case 'VI':
            result = 'Visa'
            break
        case 'JC':
            result = 'JCB Intl. Credit Card'
            break
        default:
            result = ''
    }
    return result
}*/


/******** MUSIC PLAYER **********/
/**============================**/


export const getTime = (millis) => {
    let minutes = Math.floor(millis / 60000)
    let seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
}


