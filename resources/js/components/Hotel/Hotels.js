import React, {Component} from 'react'
import {Col, Layout, Row} from 'antd'

import * as firestore from "../../services/firebase"
import * as URLS from "../../constants/urls"
import moment from "moment/moment"

import {callApi, showNotification, getLocalVal, _convertCurrencyTextToSymbol} from "../../constants/utilities"


import getUserLocale from 'get-user-locale'
import Header from "../Header"
import SiderHotels from "./SiderHotels"
import ContentHotels from "./ContentHotels"


export default class Hotels extends Component {

    constructor (props) {
        super(props)

        const accommodationsSelected = getLocalVal('accommodationsSelected', [], false).length > 0 ? getLocalVal('accommodationsSelected', [], false).split(",") : []
        const facilitiesSelected = getLocalVal('facilitiesSelected', [], false).length > 0 ? getLocalVal('facilitiesSelected', [], false).split(",") : []
        const landmarksSelected = getLocalVal('landmarksSelected', [], false).length > 0 ? getLocalVal('landmarksSelected', [], false).split(",") : []
        const distanceOrderFilter = getLocalVal('distanceOrderFilter', [], false).length > 0 ? getLocalVal('distanceOrderFilter', [], false).split(",") : []

        this.state = {
            hotels: getLocalVal('hotels', []),
            selectedLocation: getLocalVal('selectedLocation', {}),
            accessToken: getLocalVal('hotelsAccessToken', null, false),
            errorCode: 0,
            errorTitle: null,
            hotelsListLoading: false,
            qtyDays: 1,
            checkinDate: null,
            checkoutDate: null,
            accomodations: [],
            facilities: [],
            landmarks: [],
            accommodationsSelected: accommodationsSelected,
            facilitiesSelected: facilitiesSelected,
            landmarksSelected: landmarksSelected,
            priceMin: Number(getLocalVal('priceMin', 150, false)),
            priceMax: Number(getLocalVal('priceMax', 500, false)),
            starRatings: Number(getLocalVal('starRatings', 1, false)),
            guestRatingMin: Number(getLocalVal('guestRatingMin', 1, false)),

            popularOrderFilter: getLocalVal('popularOrderFilter', false, false),
            starRatingsOrderFilter: getLocalVal('starRatingsOrderFilter', null, false),
            distanceOrderFilter: distanceOrderFilter,
            distanceOrderFilterTitle: getLocalVal('distanceOrderFilterTitle', null, false),
            guestRatingOrderFilter: getLocalVal('guestRatingOrderFilter', false, false),
            priceOrderFilter: getLocalVal('priceOrderFilter', null, false),

            pageNumber: 1,
            pageSize: 50,
            currencyFrom: 'USD',
            currencyTo: getLocalVal('currencyTo', null, false),
            currencyFromToKey: '',
            currencyConvertedResult: 0,
            currencySymbol: '$',
            sortOrder: Number(getLocalVal('starRatings', 'PRICE', false))
        }
    }


    /*_getAccessToken = async () => {

        const url = URLS.URL_HOTELS_AUTH

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        const response = await callApi({
                'grant_type': 'client_credentials',
                'client_id': URLS.URL_HOTELS_CLIENT_ID,
                'client_secret': URLS.URL_HOTELS_CLIENT_SECRET,

            },
            'POST', headers, url)

        window.localStorage.setItem('hotelsAccessToken', response.access_token)

        console.log(response)

        return response.access_token
    }*/

    _getHotels = async () => {

        const {
            currencyFrom,
            selectedLocation,
            pageNumber,
            pageSize,
            qtyDays,
            accommodationsSelected,
            facilitiesSelected,
            landmarksSelected,
            priceMin,
            priceMax,
            starRatings,
            guestRatingMin,
            sortOrder
        } = this.state

        const checkinDate = moment.unix(selectedLocation.dateArrival).format('YYYY-MM-DD')
        const checkoutDate = moment.unix(selectedLocation.dateArrival).add(qtyDays, 'days').format('YYYY-MM-DD')
        const userLocale = getUserLocale()

        const apiParamsObject = {
            'destinationId': '1506246',
            'type': 'CITY',
            'pageNumber': pageNumber,
            'pageSize': pageSize,
            'adults1': '1',

            'checkIn': checkinDate,                    // Optional field
            'checkOut': checkoutDate,                   // Optional field
            'currency': currencyFrom,                   // Optional field
            'locale': userLocale.replace('-', '_'),   // Optional field
            'children1': '5,11'                          // Optional field
        }

        const starRatingFinal = starRatings > 1 ? [...Array(starRatings).keys()].map(i => i + 1).join('%2C') : "1"

        const apiParams = (key) => {
            if (accommodationsSelected && key === 'accommodationsSelected') apiParamsObject[key] = accommodationsSelected
            if (facilitiesSelected && key === 'facilitiesSelected') apiParamsObject[key] = facilitiesSelected
            if (landmarksSelected && key === 'landmarksSelected') apiParamsObject[key] = landmarksSelected
            if (priceMin && key === 'priceMin') apiParamsObject[key] = priceMin
            if (priceMax && key === 'priceMax') apiParamsObject[key] = priceMax
            if (starRatings && key === 'starRatings') apiParamsObject[key] = starRatingFinal
            if (guestRatingMin && key === 'guestRatingMin') apiParamsObject[key] = guestRatingMin
            if (sortOrder && key === 'sortOrder') apiParamsObject[key] = sortOrder
            return apiParamsObject
        }

        const apiParamsArray = [
            'accommodationsSelected', 'facilitiesSelected',
            'landmarksSelected', 'priceMin', 'priceMax',
            'starRatings', 'guestRatingMin', 'sortOrder'
        ]

        apiParamsArray.map(item => apiParams(item))
        //console.log(apiParamsObject)

        const url = URLS.URL_HOTELS_LIST
        const headers = {
            'x-rapidapi-host': URLS.xRapidapiHost,
            "x-rapidapi-key": URLS.xRapidapiKey
        }
        //const response = await callApi(apiParamsObject, 'GET', headers, url, true)

        //console.info('_getHotelsList: ')
        //console.info(response)

        if (response.result === "OK") {
            this.setState({
                hotels: response,
                hotelsListLoading: false,
                /*currencyFrom: response['vehicles'][0]['rate_totals']['rate']['currency'],*/
            }, () => {
                window.localStorage.setItem('hotels', JSON.stringify(response['data']))
            })
        } else {
            this.setState({
                errorTitle: response.errorMessage,
                hotels: null,
                hotelsListLoading: false
            }, () => {
                showNotification('Hotels list', this.state.errorTitle, 'error')
            })
        }
        return response
    }

    _addNewHotelToFirestore = (hotelsDocRef, cityName, hotels) => {

        hotelsDocRef.set({hotels: hotels}, {merge: true})
            .then(() => {
                console.info(`New hotels list was successfully added in ${cityName}!`)
            })
            .catch(err => {
                console.error("Query failed: ", err)
            })
    }

    _addHotelsCacheToFirestore = (hotels, cityName) => {
        // Create a reference to the carRentals collection
        const hotelsDocRef = firestore.connect.collection('hotelsCache').doc(cityName)

        hotelsDocRef.get().then(doc => {

            // CITY EXISTS - ADD NEW HOTEL LIST
            if (doc.exists) {
                console.info(`City ${cityName} is already exists`)

                let hotelsRef = doc.data()

                // HOTEL LIST DOESN'T EXIST - ADD
                if (!hotelsRef.hotels)
                    this._addNewHotelToFirestore(hotelsDocRef, cityName, hotels)

                // HOTEL LIST EXISTS - VOID
                else {
                    this.setState({
                        hotelsListLoading: false
                    }, () => Promise.reject(`Locations list in ${cityName} just exists.`))
                }

            }
            // CITY DOESN'T EXIST - CREATE NEW CITY AND HOTEL LIST
            else
                this._addNewHotelToFirestore(hotelsDocRef, cityName, hotels)
        }).catch(error => {
            console.error("Error getting document of the city: ", error)
        })
    }

    /**
     * Page onchange trigger
     * @param page
     * @param pageSize
     * @private
     */
    _onChangePage = (page, pageSize) => {
        /*console.log(page)
        console.log(pageSize)*/
        this.setState({
            pageNumber: page,
            pageSize: pageSize
        })

        this.props.history.push(`/hotels/page/${page}`)
    }

    /**
     * Check-in date input onchange trigger
     * @param date
     * @param dateString
     * @private
     */
    _onChangeCheckinDate = (date, dateString = {}) => {
        if (dateString === '') dateString = null

        this.setState({
            checkinDate: moment(dateString),
            qtyDays: Number(moment.duration(moment(dateString, "YYYY-MM-DD").diff(this.state.checkoutDate)).asDays())
        })
    }

    /**
     * Check-out date input onchange trigger
     * @param date
     * @param dateString
     * @private
     */
    _onChangeCheckoutDate = (date, dateString = {}) => {
        if (dateString === '') dateString = null

        this.setState({
            checkoutDate: moment(dateString),
            qtyDays: Number(moment.duration(moment(dateString, "YYYY-MM-DD").diff(this.state.checkinDate)).asDays())
        })
    }

    /**
     * Accomodations multiselect onchange trigger
     * @param value
     * @private
     */
    _onChangeAccommodationsFilter = value => {
        this._onChangeParams('accommodationsSelected', value)
    }

    /**
     * Amenities multiselect onchange trigger
     * @param value
     * @private
     */
    _onChangeFacilitiesFilter = value => {
        this._onChangeParams('facilitiesSelected', value)
    }

    /**
     * Landmarks multiselect onchange trigger
     * @param value
     * @private
     */
    _onChangeLandmarksFilter = value => {
        this._onChangeParams('landmarksSelected', value)
    }

    /**
     * Minimum price input onchange trigger
     * @param event
     * @private
     */
    _onChangePriceMinFilter = event => {
        this._onChangeParams('priceMin', event.target.value)
    }

    /**
     * Maximum price input onchange trigger
     * @param event
     * @private
     */
    _onChangePriceMaxFilter = event => {
        this._onChangeParams('priceMax', event.target.value)
    }

    /**
     * Adults/children input onchange trigger
     * @private
     * @param value
     * @param name
     */
    _onChangeAdultsChildrenFilter = (name, value) => {
        this._onChangeParams(`${name}`, value)
    }

    /**
     * Hotel star rating onchange trigger
     * @private
     * @param value
     */
    _onChangeStarRatingsFilter = value => {
        this._onChangeParams('starRatings', value)
    }

    /**
     * Hotel star rating onchange trigger
     * @private
     * @param value
     */
    _onChangeGuestRatingMinFilter = value => {
        this._onChangeParams('guestRatingMin', value)
    }

    /*****  HORIZONTAL ORDER FILTERS  *********/
    /******************** *********************/

    /**
     * 'Popular' horizontal filter onchange trigger
     * @private
     */
    _onSwitchPopularOrderFilter = () => {
        this.setState({
            starRatingsOrderFilter: null,
            distanceOrderFilter: [],
            distanceOrderFilterTitle: null,
            guestRatingOrderFilter: null,
            priceOrderFilter: null,
        }, () => {
            this._flushLocalOrderFilters(['distanceOrderFilter', 'distanceOrderFilterTitle', 'guestRatingOrderFilter', 'priceOrderFilter'])
            this._onChangeParams('popularOrderFilter', null, true)
        })
    }

    /**
     * Star rating horizontal filter onchange trigger
     * @private
     * @param value
     */
    _onChangeStarRatingsOrderFilter = value => {
        this.setState({
            popularOrderFilter: false,
            distanceOrderFilter: [],
            distanceOrderFilterTitle: null,
            guestRatingOrderFilter: null,
            priceOrderFilter: null,
        }, () => {
            this._flushLocalOrderFilters(['popularOrderFilter', 'distanceOrderFilter', 'distanceOrderFilterTitle', 'guestRatingOrderFilter', 'priceOrderFilter'])
            this._onChangeParams('starRatingsOrderFilter', value)
        })
    }

    /**
     * Distance horizontal filter onchange trigger
     * @private
     * @param value
     * @param option
     */
    _onChangeDistanceOrderFilter = (value, option) => {
        console.log(value)
        this.setState({
            popularOrderFilter: false,
            starRatingsOrderFilter: null,
            distanceOrderFilterTitle: option[0] && `${option[0].label} / ${option[1].label}`,
            guestRatingOrderFilter: null,
            priceOrderFilter: null,
        }, () => {
            this._flushLocalOrderFilters(['popularOrderFilter', 'starRatingsOrderFilter', 'guestRatingOrderFilter', 'priceOrderFilter'])
            this._onChangeParams('distanceOrderFilter', value)
        })
    }

    /**
     * Guest rating horizontal filter onchange trigger
     * @private
     */
    _onSwitchGuestRatingOrderFilter = () => {
        this.setState({
            popularOrderFilter: false,
            starRatingsOrderFilter: null,
            distanceOrderFilter: [],
            distanceOrderFilterTitle: null,
            priceOrderFilter: null,
        }, () => {
            this._flushLocalOrderFilters(['popularOrderFilter', 'starRatingsOrderFilter', 'distanceOrderFilter', 'distanceOrderFilterTitle', 'priceOrderFilter'])
            this._onChangeParams('guestRatingOrderFilter', null, true)
        })
    }

    /**
     * Price horizontal filter onchange trigger
     * @private
     * @param value
     */
    _onChangePriceOrderFilter = value => {
        this.setState({
            popularOrderFilter: false,
            starRatingsOrderFilter: null,
            distanceOrderFilter: [],
            distanceOrderFilterTitle: null,
            guestRatingOrderFilter: null,
        }, () => {
            this._flushLocalOrderFilters(['popularOrderFilter', 'starRatingsOrderFilter', 'distanceOrderFilter', 'distanceOrderFilterTitle', 'guestRatingOrderFilter'])
            this._onChangeParams('priceOrderFilter', value)
        })

    }

    /******************** *********************/
    /******************** *********************/


    /**
     * Currency selectbox onchange trigger
     * @param value
     * @private
     */
    _onChangeCurrencyFilter = value => {
        const {currencyFrom, currencyFromToKey} = this.state

        this.setState({
            currencyTo: value,
            currencyFromToKey: `${currencyFrom}_${value}`
        }, () => this._convertCurrency(currencyFromToKey).then(result => {
            _convertCurrencyTextToSymbol(value).then(currencySymbol => {
                this.setState({
                    currencyConvertedResult: result,
                    currencySymbol: currencySymbol
                }, () => this._onChangeParams('currencyTo', value))
            })
        }))
    }


    _convertCurrency = async (currencyFromToKey) => {
        const url = URLS.URL_CURRENCY_CONVERT_DATA

        const headers = {
            'Accept': 'application/json'
        }

        const response = await callApi({
            q: currencyFromToKey,
            compact: 'ultra',
            apiKey: `${URLS.currencyConvertApiKey}`
        }, 'GET', headers, url)
        return response[currencyFromToKey]
    }


    _setCurrencyValues = fromCurrency => {
        this.setState({
            currencyFrom: fromCurrency
        })
    }

    /**
     * Inputs blur trigger and resubmit filtered request
     * @private
     */
        // TO-DO: Check when the value is empty
    _onBlurFilter = () => {
        return this._getHotels()

        /*this.setState({
            hotelsListLoading: true
        }, () => this._getHotels())*/
    }

    _onChangeParams = (name, value, prevFlag = false) => {
        !prevFlag ?
            this.setState({[name]: value}, () => {
                // Save parameter in Local Storage
                window.localStorage.setItem(`${name}`, value)
            }) :
            this.setState(prevState => ({
                [name]: !prevState[name]
            }), () => window.localStorage.setItem(`${name}`, this.state[name]))
    }

    _flushLocalOrderFilters = keysToRemove => {
        keysToRemove.forEach(k => window.localStorage.removeItem(k))
    }

    _initPageNumber = () => {
        // TO-DO: get parameters correctly
        const pathName = this.props.location.pathname
        const pathNameArr = pathName.split('/')
        const pageNumber = parseInt(pathNameArr[pathNameArr.length - 1])
        const pageNumberFinal = !Number.isNaN(pageNumber) ? pageNumber : 1

        this._onChangePage(pageNumberFinal, this.state.pageSize)
    }

    componentDidMount() {
        const {selectedLocation, qtyDays, currencyFrom, currencyTo} = this.state

        this.setState({
            checkinDate: selectedLocation.dateArrival && moment.unix(selectedLocation.dateArrival),
            checkoutDate: selectedLocation.dateArrival && moment.unix(selectedLocation.dateArrival).add(qtyDays, 'days')
        })

        /**
         * Update of currency basing on saved filter selection
         */
        if (currencyFrom !== currencyTo) {
            this._onChangeCurrencyFilter(currencyTo)
        }

        //return this._getHotels()

        this._initPageNumber()

        //console.log(this.state.hotels)
    }

    /*componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.accessToken !== prevState.accessToken) {
            return this._getAccessToken().then((accessToken) => {
                return this._getHotels(accessToken)
            })
        }
    }*/

    render() {

        const {
            hotels,
            hotelsListLoading,
            pageNumber,
            pageSize,
            checkinDate,
            checkoutDate,
            accommodationsSelected,
            facilitiesSelected,
            landmarksSelected,
            priceMin,
            priceMax,
            starRatings,
            guestRatingMin,

            popularOrderFilter,
            starRatingsOrderFilter,
            distanceOrderFilter,
            distanceOrderFilterTitle,
            guestRatingOrderFilter,
            priceOrderFilter,

            qtyDays,
            currencyConvertedResult,
            currencyTo,
            currencySymbol
        } = this.state

        const {accommodationType, facilities, landmarks} = hotels && hotels.body.filters

        return (
            <>
                <Header breadcrumbHotels/>
                <Row type="flex" className="content-wrapper">
                    <Col xs={{span: 24}} sm={{span: 24}} md={{span: 24}} lg={{span: 24}} style={{height: '100%'}}>
                        <Layout className="layout-hotels">
                            <SiderHotels
                                checkinDate={checkinDate}
                                checkoutDate={checkoutDate}
                                accommodations={accommodationType.items}
                                facilities={facilities.items}
                                landmarks={landmarks.items}
                                accommodationsSelected={accommodationsSelected}
                                facilitiesSelected={facilitiesSelected}
                                landmarksSelected={landmarksSelected}
                                priceMin={priceMin}
                                priceMax={priceMax}
                                starRatings={starRatings}
                                guestRatingMin={guestRatingMin}
                                currencyTo={currencyTo}
                                currencySymbol={currencySymbol}
                                _onChangeCheckinDate={this._onChangeCheckinDate}
                                _onChangeCheckoutDate={this._onChangeCheckoutDate}
                                _onChangeAccommodationsFilter={this._onChangeAccommodationsFilter}
                                _onChangeFacilitiesFilter={this._onChangeFacilitiesFilter}
                                _onChangeLandmarksFilter={this._onChangeLandmarksFilter}
                                _onChangePriceMinFilter={this._onChangePriceMinFilter}
                                _onChangePriceMaxFilter={this._onChangePriceMaxFilter}
                                _onChangeAdultsChildrenFilter={this._onChangeAdultsChildrenFilter}
                                _onChangeStarRatingsFilter={this._onChangeStarRatingsFilter}
                                _onChangeGuestRatingMinFilter={this._onChangeGuestRatingMinFilter}
                                _onBlurFilter={this._onBlurFilter}
                            />
                            <ContentHotels
                                hotels={hotels}
                                hotelsListLoading={hotelsListLoading}
                                pageNumber={pageNumber}
                                pageSize={pageSize}
                                qtyDays={qtyDays}
                                currencyConvertedResult={currencyConvertedResult}
                                currencySymbol={currencySymbol}
                                checkinDate={checkinDate}
                                checkoutDate={checkoutDate}
                                _onChangePage={this._onChangePage}

                                popularOrderFilter={popularOrderFilter}
                                starRatingsOrderFilter={starRatingsOrderFilter}
                                distanceOrderFilter={distanceOrderFilter}
                                distanceOrderFilterTitle={distanceOrderFilterTitle}
                                guestRatingOrderFilter={guestRatingOrderFilter}
                                priceOrderFilter={priceOrderFilter}
                                _onChangeDistanceOrderFilter={this._onChangeDistanceOrderFilter}
                                _onChangeStarRatingsOrderFilter={this._onChangeStarRatingsOrderFilter}
                                _onChangePriceOrderFilter={this._onChangePriceOrderFilter}
                                _onSwitchPopularOrderFilter={this._onSwitchPopularOrderFilter}
                                _onSwitchGuestRatingOrderFilter={this._onSwitchGuestRatingOrderFilter}
                            />
                        </Layout>
                    </Col>
                </Row>
            </>
        )
    }
}
