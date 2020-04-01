import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import {connect} from "react-redux"
import * as URLS from "../../constants/urls"

import {Card, Col, Divider, Icon, Row, Spin, Tooltip, Button, Drawer, Rate, Typography, Empty, Slider} from 'antd'

const {Text} = Typography

import WeatherChart from "../WeatherChart"

// Carousel
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/alice-carousel.css'

import {
    getCityCurrentTime,
    getFirebaseDate,
    getPoiCatFormatted,
    getTimeDiffFromOriginCity,
    momentTzFormat,
    distanceUnit,
    distanceToShow,
    temperatureToShow,
    tempUnit,
    getLocalVal,
    dateFormat
} from '../../constants/utilities'

import {saveCityData} from "../../actions/cityData-actions"
import * as firestore from "../../services/firebase"


const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1172004_rtrgqyuw7g.js'
})

//const authId = 'dGVzdDp0ZXN0'


class NoDataBlock extends Component {
    render() {
        return (
            <Empty
                image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
                imageStyle={{
                    height: 60,
                }}
                description={
                    <span>No data available for {this.props.entity}</span>
                }
            />
        )
    }
}


class Poi extends Component {

    state = {
        formattedPoiAddress: null,
        poiImage: null,
        poiImageLoading: true,
        photoMaxWidth: 300,
        photoMaxHeight: 200
    }

    _openedOrClosed = (status) => {
        return status ? <Text style={{color: '#6FC76A'}}>Opened</Text> : <Text type="danger">Closed</Text>
    }

    _getAddressFromCoordinates = (lat, lng) => {
        let urlApi = `${URLS.URL_GOOGLE_MAPS_GEOCODE}&latlng=${lat},${lng}`

        fetch(urlApi)
            .then(res => res.json())
            .then(data => {
                if (data.status !== 'ZERO_RESULTS')
                    this.setState({formattedPoiAddress: data.results[0]['formatted_address']})
                else {
                    console.info('Google Maps Geocode - no results')
                }

            })
            .catch((error) => console.error(error))
    }

    _getPoiPhoto = (photoRef, photoMaxWidth, photoMaxHeight, poiId) => {
        console.log('GET PHOTO FROM GOOGLE API...')

        let urlApi = `${URLS.URL_GOOGLE_PHOTOS}maxwidth=${photoMaxWidth}&maxheight=${photoMaxHeight}&photoreference=${photoRef}`
        fetch(urlApi, {
            method: "GET",
            redirect: "follow",
            headers: {
                'Access-Control-Request-Headers': 'X-Final-Url',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        })
            .then(response => {
                let photoUrl = response.headers.get("X-Final-Url")
                this.setState({
                    poiImage: photoUrl,
                    poiImageLoading: false
                }, () => {
                    this._savePoiPhotoToFirestore(poiId, photoUrl)
                })
            }).catch((err) => console.error(err))
    }

    _checkFirestorePoiPhoto = (photos, maxWidth, maxHeight, id) => {
        const poiCachePhotos = firestore.connect.collection('poiCachePhotos').doc('photos')
        poiCachePhotos.get().then(doc => {
            if (doc.exists) {
                let photosRef = doc.data()

                // PHOTO WITH ID EXISTS AND IS NOT EXCEEDED QUOTA IMAGE
                if (photosRef[id] && photosRef[id].includes('googleusercontent.com')) {

                    // PHOTO EXISTS - GET FROM FIRESTORE
                    this.setState({
                        poiImage: photosRef[id],
                        poiImageLoading: false
                    }, () => {
                        console.log('GET PHOTO FROM FIRESTORE...')
                    })
                }
                // PHOTO DOESN'T EXIST - GET FROM GOOGLE API
                else {
                    this._getPoiPhoto(photos, maxWidth, maxHeight, id)
                }
            }
        })
    }

    _savePoiPhotoToFirestore = (poiId, photoUrl) => {
        const poiCachePhotos = firestore.connect.collection('poiCachePhotos').doc('photos')

        poiCachePhotos.set({
            [poiId]: photoUrl
        }, {merge: true})
            .then(() => {
                console.log(`Photo with id ${poiId} was successfully saved!`)
            })
            .catch(err => {
                console.error("Query failed: ", err)
            })
    }

    componentDidMount() {
        const {photos, location, id} = this.props.poi
        const {photoMaxWidth, photoMaxHeight} = this.state

        if (photos) {
            this._checkFirestorePoiPhoto(photos, photoMaxWidth, photoMaxHeight, id)
        } else {
            this.setState({
                poiImage: '../../images/poi-no-image.jpg',
                poiImageLoading: false
            })
        }
        this._getAddressFromCoordinates(location.lat, location.lng)
    }

    componentWillUnmount() {
        this.setState({
            formattedPoiAddress: null,
            poiImage: null
        })
    }

    render() {
        const {id, name, isOpenedNow, rating, userRatingsTotal, vicinity} = this.props.poi

        const stateOpened = isOpenedNow && isOpenedNow['open_now']
        const stateOpenedText = isOpenedNow && this._openedOrClosed(stateOpened)

        return (
            <div data-id={id} className="poi">
                <Row type="flex" justify="space-around" align="middle">
                    <Col span={15}>
                        <div className="fs18 bold">{name}</div>

                        <div className="inline">
                            <Rate disabled size="small" defaultValue={Math.round(rating)}/>
                            {
                                userRatingsTotal &&
                                <div className="wrapper-rating">
                                    <div className="vert-divider"/>
                                    <span className="total-rating-align">
                                        <span className="fs16 mrgn-r-5">{userRatingsTotal}</span>
                                        <Tooltip title="User ratings total">
                                            <Icon className="fs12 warning-info pointer" type="question-circle"/>
                                        </Tooltip>
                                    </span>
                                </div>
                            }
                        </div>

                        <div className="fs14 mrgn-t-10 vert-align-ctr">
                            <Icon type="environment" className="fs16 mrgn-r-5"/>
                            <div className="italic">Address:</div>
                            <div className="mrgn-l-5">{this.state.formattedPoiAddress}</div>
                        </div>

                        <div className="fs14 mrgn-t-10 vert-align-ctr">
                            <Icon type="compass" className="fs16 mrgn-r-5"/>
                            <div className="italic">Vicinity:</div>
                            <div className="mrgn-l-5">{vicinity}</div>
                        </div>

                        {isOpenedNow &&
                        <div className="fs14 mrgn-t-10 vert-align-ctr">
                            <Icon type={`${stateOpened ? 'unlock' : 'lock'}`} className="fs16 mrgn-r-5"/>
                            <span className="fs14 bold">{stateOpenedText}</span>
                        </div>}
                    </Col>
                    <Col span={1}/>
                    <Col span={8}>
                        <div className="vert-align-ctr text-centered">
                            {
                                this.state.poiImageLoading ?
                                    <Spin size="large"/> :
                                    <img className="poi-image" src={this.state.poiImage} alt=""/>
                            }
                        </div>
                    </Col>
                </Row>
                <Divider dashed/>
            </div>
        )
    }
}


class ContentDrawer extends Component {

    state = {
        poisData: getLocalVal('poisData', [])
    }

    _addNewCatToFirestore = (cacheRef, cityName, categoryName, localPoiList) => {
        console.log(localPoiList)

        cacheRef.set({[categoryName]: localPoiList}, {merge: true})
            .then(() => {
                console.log(`New category (${categoryName}) was successfully added in ${cityName}!`)
            })
            .catch(err => {
                console.error("Query failed: ", err)
            })
    }

    _addPoiToFirestore = (localPoiList, cityName, poiCategoryClickedRaw) => {

        // Create a reference to the cities collection
        const poiCache = firestore.connect.collection('poiCache').doc(cityName)

        poiCache.get().then(doc => {

            // CITY EXISTS - ADD NEW CATEGORY
            if (doc.exists) {
                console.log(`City ${cityName} is already exist`)

                let cityRef = doc.data()

                // CATEGORY DOESN'T EXIST - ADD
                if (!cityRef[poiCategoryClickedRaw])
                    this._addNewCatToFirestore(poiCache, cityName, poiCategoryClickedRaw, localPoiList)

                // CATEGORY EXISTS - VOID
                else
                    return Promise.reject(`${poiCategoryClickedRaw} in ${cityName} just exists.`)
            }
            // CITY DOESN'T EXIST - CREATE NEW CITY AND CATEGORY
            else
                this._addNewCatToFirestore(poiCache, cityName, poiCategoryClickedRaw, localPoiList)
        }).catch(error => {
            console.log("Error getting document of the city: ", error)
        })
    }

    render() {

        const {poiCategoryClicked, poiListByCategory, poiListByCategoryLoading, poiCategoryClickedRaw, cityName} = this.props

        let contentToRender = null

        if (poiListByCategoryLoading) {
            contentToRender = <div className="text-centered"><Spin size="large"/></div>
        } else {
            if (poiListByCategory.length === 0) {
                contentToRender = <NoDataBlock entity={poiCategoryClicked}/>

                // Add the empty POIs category to the Firestore
                this._addPoiToFirestore(poiListByCategory, cityName, poiCategoryClickedRaw)
            } else {

                contentToRender = poiListByCategory
                // Decrescent order of POIs by rating
                    .sort((a, b) => a['rating'] && a['rating'] < b['rating'])
                    .sort((a, b) => a['userRatingsTotal'] && a['userRatingsTotal'] < b['userRatingsTotal'])
                    .map((poi, key) => {
                        return <Poi key={key} poi={poi}/>
                    })

                if (this.props.isVisibleCatPoiDrawer) {

                    // Sort the POI list of the specific category
                    const poiListByCatOrdered =
                        poiListByCategory
                            .sort((a, b) => a['rating'] && a['rating'] < b['rating'])
                            .sort((a, b) => a['userRatingsTotal'] && a['userRatingsTotal'] < b['userRatingsTotal'])


                    // Add the main array with all the POIs to Local Storage
                    window.localStorage.setItem('poisData', JSON.stringify(poiListByCatOrdered))

                    // Add the main array with all the POIs to the Firestore
                    this._addPoiToFirestore(poiListByCatOrdered, cityName, poiCategoryClickedRaw)
                }
            }
        }
        return contentToRender
    }
}


class PoiCategoriesContainer extends Component {

    state = {
        poiListByCategory: [],
        poiListByCategoryLoading: true,
        isVisibleCatPoiDrawer: false,
        poiCategoryClicked: null,
        poiCategoryClickedRaw: null,
        poiRadius: distanceToShow(Number(getLocalVal('poiRadiusSetting', 100, false))),
        poiRadiusUnit: distanceUnit()
    }

    /**
     * Open the POI list of selected category
     * @private
     */
    _showDrawer = (poiCat, poiCatFormatted, id) => {
        this.setState({
            poiListByCategoryLoading: true,
            isVisibleCatPoiDrawer: true,
            poiCategoryClicked: poiCatFormatted,
            poiCategoryClickedRaw: poiCat
        }, () => {
            this._checkFirestorePois(poiCat)
            this.Carousel.slideTo(id)
            this.props._stopCurrentTimer()
        })
    }

    /**
     * Close the POI list of selected category
     * @private
     */
    _onCloseDrawer = () => {
        this.setState({
            isVisibleCatPoiDrawer: false
        })
    }

    /**
     * Navigate by POI categories carousel
     * @param direction
     * @private
     */
    _onPrevNextButtonClick = direction => {
        direction === 'prev' ? this.Carousel.slidePrev() : this.Carousel.slideNext()
        this.props._stopCurrentTimer()
    }

    /**
     * Check out the existence of poi list cache in Firestore
     * @param poiCat
     * @private
     */
    _checkFirestorePois = poiCat => {
        const {cityName} = this.props
        const {poiCategoryClickedRaw} = this.state

        // Create a reference to the cities collection
        const poiCache = firestore.connect.collection('poiCache').doc(cityName)
        poiCache.get().then(doc => {

            // CITY EXISTS
            if (doc.exists) {
                let cityRef = doc.data()

                // CATEGORY EXISTS - GET FROM FIRESTORE
                if (cityRef[poiCategoryClickedRaw]) {
                    //return Promise.reject(`${poiCategoryClickedRaw} in ${cityName} just exists.`)
                    this.setState({
                        poiListByCategory: cityRef[poiCategoryClickedRaw],
                        poiListByCategoryLoading: false
                    }, () => {
                        console.log('GET POIS FROM FIRESTORE...')
                    })
                }
                // CATEGORY DOESN'T EXIST - GET FROM GOOGLE API
                else
                    this._getPoisByCategory(poiCat)
            }
            // CITY DOESN'T EXIST - GET FROM GOOGLE API
            else
                this._getPoisByCategory(poiCat)
        }).catch(error => {
            console.log("Error getting document of the city: ", error)
        })
    }


    /**
     *  Request the list of POI categories
     **/
    _getPoisByCategory = poiCat => {

        const {coords} = this.props
        const {poiRadius} = this.state

        let urlApi = `${URLS.URL_GOOGLE_NEARBY_SEARCH}location=${coords.latitude},${coords.longitude}&radius=${poiRadius * 1000}&type=${poiCat}`

        fetch(urlApi, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            credentials: "omit"
        })
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'ZERO_RESULTS') {
                    let poiListByCategory = []
                    data.results.map(poi => {
                        const {types, geometry, id, name, opening_hours, photos, rating, user_ratings_total, vicinity} = poi
                        poiListByCategory.push({
                            'types': types,
                            'location': geometry.location,
                            'id': id,
                            'name': name,
                            'isOpenedNow': opening_hours || null,
                            'photos': photos ? photos[0]['photo_reference'] : null,
                            'rating': rating || null,
                            'userRatingsTotal': user_ratings_total || null,
                            'vicinity': vicinity || null,
                            'cityName': this.props.cityName,
                            'timestamp': firestore.firestoreAccess.Timestamp.fromDate(new Date())
                        })
                    })

                    this.setState({
                        poiListByCategory: poiListByCategory,
                        poiListByCategoryLoading: false
                    })
                } else {
                    this.setState({
                        poiListByCategory: [],
                        poiListByCategoryLoading: false
                    }, () => console.info('URL_GOOGLE_NEARBY_SEARCH - no results'))
                }
            }).catch((error) => console.error(error))
    }

    /**
     * Observe change radius event of pois search
     * @param radius
     * @private
     */
    _onChangePoiRadius = radius => {
        this.setState({poiRadius: radius}, () => {
            window.localStorage.setItem('poiRadiusSetting', radius)
        })
    }

    render() {

        const {
            isVisibleCatPoiDrawer,
            poiCategoryClicked,
            poiListByCategory,
            poiListByCategoryLoading,
            poiCategoryClickedRaw,
            poiRadius,
            poiRadiusUnit
        } = this.state

        const {cityName} = this.props

        const poiCategoriesList = [
            'museum',
            'library',
            'park',
            'shopping_mall',
            'cafe',
            'art_gallery',
            'bar',
            'stadium',
            'restaurant',
            'train_station',
            'movie_theater',
            'night_club',
            'amusement_park',
            'aquarium',
            'bowling_alley',
            'campground',
            'casino',
            'hindu_temple',
            'meal_delivery',
            'meal_takeaway',
            'mosque',
            'movie_rental',
            'rv_park',
            'spa',
            'synagogue',
            'tourist_attraction',
            'university',
            'zoo'
        ]

        const poiCategoriesRender = poiCategoriesList.map((poiCat, id) => {

            const poiCategoryFormatted = getPoiCatFormatted(poiCat)
            return (
                <Card key={id}
                      className="poi-category pointer"
                      onClick={() => this._showDrawer(poiCat, poiCategoryFormatted, id)}>
                    <img src={`../../images/poi-thumbs/${poiCat}.jpg`} alt={poiCategoryFormatted}/>
                    <div className="black-overlay"/>
                    <div className="fs17 truncate poi-category-text">{poiCategoryFormatted}</div>
                </Card>
            )
        })

        const poiRadiusFormatter = (value) => {
            return `${value} ${poiRadiusUnit}`
        }

        const poiRadiusMarks = {
            5: `5 ${poiRadiusUnit}`,
            300: `300 ${poiRadiusUnit}`,
            500: `500 ${poiRadiusUnit}`
        }

        // TO-DO: Fix the plural form | https://www.grammarly.com/blog/plural-nouns/
        /*const poiCategoryFormatted = (category) => {
            let lastChar = category.slice(-1)
            if( lastChar === 'y') {

            }
        }*/

        return (
            <>
                <Row gutter={{xs: 3, sm: 8, md: 12, lg: 12}} type="flex" justify="center">
                    <Col span={24}>
                        <Card className="city-result-card poi-categories">
                            <Row type="flex" justify="start" align="middle" className="mrgn-b-50">
                                <Col offset={1} span={11}>
                                    <div className="fs28 text-left mrgn-l-5">
                                        Find point of your interest by category
                                    </div>
                                </Col>
                                <Col offset={3} span={8}>
                                    <div className="fs14">Radius</div>
                                    <Slider
                                        min={5}
                                        step={5}
                                        max={500}
                                        marks={poiRadiusMarks}
                                        included={false}
                                        onChange={this._onChangePoiRadius}
                                        defaultValue={poiRadius}
                                        tipFormatter={poiRadiusFormatter}/>
                                </Col>
                            </Row>

                            <Row gutter={{xs: 2, sm: 2, md: 2, lg: 2}} type="flex" justify="center" align="middle">
                                <Col span={1}>
                                    <Button shape="circle" className="poi-prev-button"
                                            onClick={() => this._onPrevNextButtonClick('prev')}>
                                        <Icon type="left" className="circle-button"/>
                                    </Button>
                                </Col>
                                <Col span={22}>
                                    {
                                        <AliceCarousel
                                            mouseTrackingEnabled
                                            touchTrackingEnabled
                                            preventEventOnTouchMove
                                            items={poiCategoriesRender}
                                            dotsDisabled
                                            autoHeight
                                            infinite={false}
                                            buttonsDisabled={true}
                                            onSlideChange={() => this.props._stopCurrentTimer()}
                                            ref={el => this.Carousel = el}
                                            responsive={{
                                                0: {items: 1},
                                                600: {items: 3},
                                                960: {items: 6},
                                                1280: {items: 6},
                                                1920: {items: 6},
                                            }}
                                        />
                                    }
                                </Col>
                                <Col span={1}>
                                    <Button shape="circle" className="poi-next-button"
                                            onClick={() => this._onPrevNextButtonClick('next')}>
                                        <Icon type="right" className="circle-button"/>
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* POI list of selected category */}
                <Drawer
                    title={`${poiCategoryClicked}s in ${cityName} within a ${poiRadius} ${poiRadiusUnit} radius`}
                    width="40%"
                    onClose={this._onCloseDrawer}
                    visible={isVisibleCatPoiDrawer}
                    className="poi-drawer">
                    <ContentDrawer poiCategoryClicked={poiCategoryClicked}
                                   poiListByCategory={poiListByCategory}
                                   poiCategoryClickedRaw={poiCategoryClickedRaw}
                                   poiListByCategoryLoading={poiListByCategoryLoading}
                                   poiRadius={poiRadius}
                                   isVisibleCatPoiDrawer={isVisibleCatPoiDrawer}
                                   cityName={cityName}/>
                </Drawer>
            </>
        )
    }
}


class CityResults extends Component {

    static defaultProps = {
        temperatureLow: 0,
        temperatureHigh: 0
    }

    constructor(props) {
        super(props)

        this.state = {
            currentTemp: temperatureToShow(this.props.weatherData['currently']['temperature']),
            latitude: this.props.weatherData['latitude'],
            longitude: this.props.weatherData['longitude'],
            warningText: null,
            warningUrl: null,
            warningIndex: 0,
            warningLastUpdated: null,
            warningLoading: true,
            warningDataLoaded: false,
            currentTime: null,
            currentTimeLoading: true,
            country: this.props.country || '',
            poi: []
        }

        this.cityCurrentTime = null
    }

    _getCurrentTime = () => {
        this.setState({
            currentTime: getCityCurrentTime(this.props.weatherData.timezone),
            currentTimeLoading: false
        })
    }

    _saveSelectedLocation = (country, cityName, dateArrival) => {
        const selectedLocation = {
            country: country,
            cityName: cityName,
            dateArrival: dateArrival
        }
        window.localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation))
    }

    _openCarRentalView = () => {
        const country =  this.state.country
        const cityName = this.props.cityData.cityName
        const dateArrival = this.props.cityData.dateArrival.seconds

        this._saveSelectedLocation(country, cityName, dateArrival)

        this.props.history.push({
            pathname: '/car-rentals'
        })
    }

    _openHotelView = () => {
        this.props.history.push('/hotels')
    }

    _getCountryWarningData = () => {
        let country2LetterCode = this.state.country
        //let country2LetterCode = "IT"
        let urlApi = `${URLS.URL_COUNTRY_WARNING_DATA}${country2LetterCode}`

        fetch(urlApi)
            .then(res => res.json())
            .then(json => {
                const reply = json.api_status.reply
                if (reply.code === '200' && reply.status === "ok") {
                    const dataEn = json.data.lang.en
                    const situation = json.data.situation
                    const warningText = dataEn.advice
                    const warningUrl = dataEn.url_details
                    const warningIndex = situation.rating
                    const warningLastUpdated = situation.updated

                    this.setState({
                        warningText: warningText,
                        warningUrl: warningUrl,
                        warningIndex: warningIndex,
                        warningLastUpdated: warningLastUpdated,
                        warningLoading: false,
                        warningDataLoaded: true,
                    })
                } else {
                    this.setState({
                        warningLoading: false,
                        warningDataLoaded: false
                    }, () => console.info('Travel Warnings - no results'))

                }

            }).catch((error) => console.error(error))
    }

    _renderWarningIcon = () => {
        let index = this.state.warningIndex
        if (index >= 0 && index <= 2.5) {
            return (
                <picture>
                    <img className="warning-img" src="../../../images/warnings-icons/low-risk.svg"
                         alt="Low Risk"/>
                </picture>)
        } else if (index > 2.5 && index <= 3.5) {
            return (
                <picture>
                    <img className="warning-img" src="../../../images/warnings-icons/medium-risk.svg"
                         alt="Medium Risk"/>
                </picture>)
        } else if (index > 3.5 && index <= 4.5) {
            return (
                <picture>
                    <img className="warning-img" src="../../../images/warnings-icons/high-risk.svg"
                         alt="High Risk"/>
                </picture>)
        } else {
            return (
                <picture>
                    <img className="warning-img" src="../../../images/warnings-icons/extreme-warning.svg"
                         alt="Extreme Warning"/>
                </picture>)
        }
    }

    _stopCurrentTimer = () => {
        this.cityCurrentTime && clearInterval(this.cityCurrentTime)
    }

    componentWillMount() {
        this._getCountryWarningData()
    }

    componentDidMount() {
        this.cityCurrentTime = setInterval(() => this._getCurrentTime(), 1000)
    }

    componentWillUnmount() {
        //this._stopCurrentTimer()
        this.cityCurrentTime && clearInterval(this.cityCurrentTime)
    }

    render() {

        const {cityData, weatherData} = this.props

        const {currentTime, currentTimeLoading, currentTemp, warningText, warningLastUpdated, warningUrl, warningLoading, warningDataLoaded, latitude, longitude} = this.state
        /**
         * TO-DO - Pick up the user's geo position from browser
         */
        const originCityTz = 'Europe/Rome'
        const originCity = 'Milan'

        const timeWeatherFormatted = getFirebaseDate(cityData.dateArrival.seconds, dateFormat('weatherWidget'))
        const dateArrivalFormatted = getFirebaseDate(cityData.dateArrival.seconds, dateFormat('cityResults'))
        const timeDiffFromOriginCity = getTimeDiffFromOriginCity(originCityTz, weatherData.timezone)

        const dataFormat = (data) => {
            return weatherData['daily']['data'].slice(1).map(i => Math.round(i[data]))
        }

        const lowTemp = dataFormat('temperatureLow')
        const highTemp = dataFormat('temperatureHigh')
        const windSpeed = dataFormat('windSpeed')

        const weekWeatherData = {lowTemp, highTemp, windSpeed}


        return (
            <Row type="flex" justify="center" className="city-result-modal">
                <Col className="container-cell">

                    {/* Header */}
                    <Row type="flex" justify="space-around" align="middle" className="text-centered">
                        <Col span={24}>
                            {/*<div className="fs24">Enjoy {cityData.cityName}</div>*/}
                            <div className="fs18 mrgn-tb-10">{dateArrivalFormatted}</div>
                        </Col>
                    </Row>

                    {/* Time/timezone, Weather & Travel warnings */}
                    <Row gutter={{xs: 3, sm: 8, md: 12, lg: 12}} type="flex" justify="center">

                        {/* Timezone offset and current city time */}
                        <Col xs={{span: 24}} sm={{span: 24, order: 2}} md={{span: 12, order: 2}}
                             lg={{span: 12, order: 2}} xl={{span: 12, order: 2}} xxl={{span: 6, order: 1}}>
                            <Card className="city-result-card text-centered">
                                <div className="fs20">{timeDiffFromOriginCity} {timeDiffFromOriginCity === '+1' ? 'hour' : 'hours'}</div>
                                <div className="fs20">from {originCity}</div>
                                <Divider dashed/>
                                <div className="fs20">Current time in {cityData.cityName}:</div>
                                <div className="fs20">
                                    {currentTimeLoading ? <Spin/> : currentTime}
                                </div>
                            </Card>
                        </Col>

                        {/* Weather widget */}
                        <Col xs={{span: 24}} sm={{span: 24, order: 1}} md={{span: 24, order: 1}}
                             lg={{span: 24, order: 1}} xl={{span: 24, order: 1}} xxl={{span: 12, order: 1}}>
                            <Card className="city-result-card weather-data">
                                <div className="weather-top">
                                    <div className="weather-icon-text">
                                        <IconFont className="weather-icon" type={`icon-${weatherData['daily'].icon}`}/>
                                        <div className="weather-text">{timeWeatherFormatted}</div>
                                    </div>
                                    <div className="weather-big-temp">{currentTemp}°{tempUnit()}</div>
                                </div>
                                <div className="weather-chart">
                                    <WeatherChart weekWeatherData={weekWeatherData}/>
                                </div>
                            </Card>
                        </Col>

                        {/* Travel Warnings */}
                        <Col xs={{span: 24}} sm={{span: 24, order: 3}} md={{span: 12, order: 3}}
                             lg={{span: 12, order: 3}} xl={{span: 12, order: 3}} xxl={{span: 6, order: 1}}>
                            <Card className="city-result-card text-centered">
                                {warningLoading ?
                                    <Spin size="large"/> :
                                    warningDataLoaded ?
                                    <div>
                                        <div className="fs20">
                                            {warningText}
                                        </div>
                                        <Button type="link" href={warningUrl} target="_blank" className="fs12">
                                            More information here
                                        </Button>
                                        <div className="fs12 muted-text">
                                            Last update on: {momentTzFormat(warningLastUpdated, null, 'DD MMM YY HH:mm:ss')}
                                        </div>
                                        <Divider dashed className="mrgn-t-5"/>
                                        {this._renderWarningIcon()}
                                    </div> : <NoDataBlock entity={'Warning System'}/>

                                }
                            </Card>
                        </Col>
                    </Row>

                    {/* Car rentals & Hotels */}
                    <Row gutter={{xs: 3, sm: 8, md: 12, lg: 12}} type="flex" justify="center">
                        <Col xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}} style={{padding: 0}}>
                            <Card className="city-result-card car-rental" onClick={() => this._openCarRentalView()}>
                                <div className="fs35 absolute-text">Find nearest car rental</div>
                                <picture>
                                    <img src="../../../images/car-rental.svg" alt="Nearest car rentals"/>
                                </picture>
                            </Card>
                        </Col>
                        <Col xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}}>
                            <Card className="city-result-card hotel" onClick={() => this._openHotelView()}>
                                <div className="fs35 absolute-text">Find nearest hotel</div>
                                <picture>
                                    <img src="../../../images/hotel.svg" alt="Nearest hotels"/>
                                </picture>
                            </Card>
                        </Col>
                    </Row>

                    {/* POI categories list */}
                    <PoiCategoriesContainer coords={{latitude, longitude}}
                                            cityName={cityData.cityName}
                                            _stopCurrentTimer={this._stopCurrentTimer}/>
                </Col>
            </Row>
        )
    }
}


function mapStateToProps(state) {
    return {
        /*cityDatas: state.cityDataStore.cityDatas,
        loading: state.cityDataStore.loading,
        errors: state.cityDataStore.errors*/
    }
}

export default withRouter(connect(mapStateToProps, {saveCityData})(CityResults))

CityResults.propTypes = {
    temperatureLow: PropTypes.number,
    temperatureHigh: PropTypes.number
}