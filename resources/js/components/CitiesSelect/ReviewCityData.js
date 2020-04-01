import React, {Component} from 'react'
import {Button, Card, Col, Icon, Row} from 'antd'
import Header from "../Header"
import moment from 'moment'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {saveCityData} from "../../actions/cityData-actions"
import {fetchAllCityData} from "../../actions/cityData-actions"

import {connect} from "react-redux"
import * as URLS from "../../constants/urls"
import {dateFormat, getFirebaseDate, getLocalVal} from '../../constants/utilities'
import * as firestore from "../../services/firebase"

const authId = 'dGVzdDp0ZXN0'


const BigCityName = (props) => {
    return <div className="big-city-text">{props.cityName}</div>
}


const CityDataReview = (props) => {

    const transportType = [
        {id: 1, type: 'airplane'},
        {id: 2, type: 'car'},
        {id: 3, type: 'train'}
    ]

    const currentTransportType = transportType.find(x => x.id === props.cityDatas.transportTypeSelected).type
    const dateArrival = getFirebaseDate(props.cityDatas.dateArrival.seconds, dateFormat('reviewData'))


    return (
        <Col xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}}>
            {/*<Col xs={{span: 4}} sm={{span: 8}} md={{span: 12}} lg={{span: 12}}>*/}
            <Card className="review-city-card"
                  cover={<BigCityName cityName={props.cityDatas.cityName}/>}>
                <div className="inline">
                    <FontAwesomeIcon icon="calendar-check" className="calendar-icon"/>
                    <div className="fs16 ant-card-meta-description">Arrival on:</div>
                    <div className="fs18 ant-card-meta-title">{dateArrival}</div>
                </div>

                <div className="inline">
                    <FontAwesomeIcon icon={currentTransportType === 'airplane' ? 'plane' : currentTransportType}
                                     className="transport-icon"/>
                    <div className="fs16 ant-card-meta-description">Transport:</div>
                    <div className="fs18 ant-card-meta-title">{currentTransportType}</div>
                </div>
            </Card>
        </Col>
    )
}


class ReviewCityData extends Component {

    constructor(props) {
        super(props)

        this.state = {
            title: "Review your data",
            txtBack: 'Go back',
            cityData: getLocalVal('cityDataArr', [])['cityData'],
            markers: getLocalVal('cityDataArr', [])['markers'],
            weatherData: getLocalVal('cityDataArr', [])['weatherData'],
            itemsProcessed: 0
        }
    }

    _saveLocallyMarkersAndWeather = () => {
        const {cityData, markers, weatherData} = this.state
        let cityDataCount = cityData.length
        let markersCount = markers.length
        let weatherDataCount = weatherData.length

        let localMarkersArr = markers
        let localWeatherDataArr = weatherData

        if (markersCount < cityDataCount) {
            markers.map(item => {
                localMarkersArr.push(item)
            })
        }
        if (weatherDataCount < cityDataCount) {
            weatherData.map(item => {
                localWeatherDataArr.push(item)
            })
        }
        /** TO-DO: Is in needed??? **/
        if (markersCount >= cityDataCount || weatherDataCount >= cityDataCount) {
            localMarkersArr = markers ? markers : localMarkersArr
            localWeatherDataArr = weatherData ? weatherData : localWeatherDataArr
        }

        const newCityDataArr = {
            cityData: cityData,
            markers: localMarkersArr,
            weatherData: localWeatherDataArr
        }

        console.log(markers)
        console.log(weatherData)

        window.localStorage.setItem('cityDataArr', JSON.stringify(newCityDataArr))
        return {data: newCityDataArr, proceed: 1}
    }

    _addToFavorites = (data) => {
        const citiesRef = firestore.connect.collection('favoriteCities').doc(authId)
        firestore.connect.runTransaction(transaction => {

            return transaction.get(citiesRef).then(doc => {

                if (!doc.data().cities) {
                    transaction.set(citiesRef, {
                        cities: data
                    }, {merge: true})
                } else {
                    const tempArr = doc.data().cities
                    if (tempArr.filter(i => i.id === this.props.id).length === 0) {
                        transaction.update(citiesRef, {cities: data})
                    } else
                        return Promise.reject("Value in Ids array does exist!")
                }
            })
        }).then(() => {
            console.info("Transaction successfully committed!")
        }).catch(error => {
            console.log("Transaction failed: ", error)
        })
    }

    _redirectToMap = () => {
        let response = this._saveLocallyMarkersAndWeather()

        if (response.data && response.proceed) {
            this.props.history.push({
                pathname: '/map',
                state: response.data
            })
        }
    }

    _getWeatherData = (coordinates, datetime, cityName, id, action) => {
        //let urlApi = `${URLS.URL_DARKSKY_DATA}${coordinates.lat},${coordinates.lng},${datetime}?lang=en&units=si&exclude=currently,flags,minutely,hourly,alerts`
        let urlApi = `${URLS.URL_DARKSKY_DATA}${coordinates.lat},${coordinates.lng}?lang=en&units=si&exclude=flags,minutely,hourly,alerts`

        fetch(urlApi, {
            method: "GET",
            credentials: 'same-origin'
        })
            .then(response => response.json())
            .then(data => {
                if (data) {

                    let newWeatherData = data
                    newWeatherData.id = id
                    newWeatherData.cityName = cityName
                    // Timestamp saving for caching
                    newWeatherData.timestamp = moment().format('YYYY-MM-DD HH:mm')


                    // ADDING OF NEW MARKERS WHEN NEW CITY WAS ADDED
                    if (action === 'add') {
                        this.setState(prevState => ({
                            weatherData: prevState.weatherData.concat(newWeatherData).sort((a, b) => (a.id > b.id) ? 1 : -1)
                        }))
                    }
                    // REPLACE THE OLD MARKER/S WITH NEW ONE/S WHEN THE CITY WAS CHANGED
                    else {
                        const weatherData = this.state.weatherData
                        weatherData[id] = newWeatherData
                        this.setState({
                            weatherData: weatherData.sort((a, b) => (a.id > b.id) ? 1 : -1)
                        })
                    }
                } else {
                    console.info('Dark Sky API - no results')
                }
            }).catch((error) => console.error(error))
    }

    _getWeatherFromMarkers = () => {
        const {cityData, markers, weatherData} = this.state
        markers.forEach((marker, index) => {
            if (!weatherData[index]) {
                let lat = marker.lat
                let lng = marker.lng
                let dateArrivalFormatted = `${cityData[index].dateArrival}T00:00:00`

                console.info(`Requesting of weather for ${cityData[index].cityName}...`)
                this._getWeatherData({lat, lng}, dateArrivalFormatted, cityData[index].cityName, index)
            }
        })
    }

    _getCoordinatesFromAddress = (cityName, dateArrival, id, action) => {
        let urlApi = `${URLS.URL_GOOGLE_MAPS_GEOCODE}&address=${cityName}`
        fetch(urlApi)
            .then(res => res.json())
            .then(data => {
                if (data.status !== 'ZERO_RESULTS') {
                    let result = data.results[0]
                    let address = result['address_components'], country = ''
                    address.map(item => {
                        if (item['types'].includes("country"))
                            country = item['short_name']
                    })

                    let loc = result['geometry']['location']
                    let lat = loc.lat
                    let lng = loc.lng
                    let dateArrivalFormatted = `${dateArrival}T00:00:00`
                    loc.id = id
                    loc.cityName = cityName
                    loc.country = country

                    // ADDING OF NEW MARKERS WHEN NEW CITY WAS ADDED
                    if (action === 'add') {
                        this.setState(prevState => ({
                                markers: prevState.markers.concat(loc).sort((a, b) => (a.id > b.id) ? 1 : -1)
                            }), () => {
                                // Request Weather Data
                                this._getWeatherData({lat, lng}, dateArrivalFormatted, cityName, id, 'add')
                            }
                        )
                    }
                    // REPLACE THE OLD MARKER/S WITH NEW ONE/S WHEN THE CITY WAS CHANGED
                    else {
                        const markers = this.state.markers
                        markers[id] = loc
                        this.setState({
                            markers: markers.sort((a, b) => (a.id > b.id) ? 1 : -1)
                        }, () => {
                            // Request Weather Data
                            this._getWeatherData({lat, lng}, dateArrivalFormatted, cityName, id, 'replace')
                        })
                    }
                } else {
                    console.info('Google Maps Geocode - no results')
                }

            }).catch((error) => console.error(error))
    }

    _handleWeatherData = (index, item) => {
        let currIterator = this.state.weatherData[index]

        if (currIterator && currIterator.id === item.id) {
            let lastTimestamp = moment(currIterator.timestamp)
            let currentTimestamp = moment()
            let timePassedFromLastUpdate = moment.duration(currentTimestamp.diff(lastTimestamp))
            let hours = timePassedFromLastUpdate.asHours()

            // Check if weather data isn't updated for more that 10 hours - request update
            if (hours > 10) {
                this._getWeatherFromMarkers()
            } else {
                console.info(`Weather and markers for ${item.cityName} wasn't requested.`)
            }
        }
    }

    _getMarkersAndWeatherFromCities = (citiesCount = 0, markersCount = 0, weatherDataEmpty = false) => {
        const {cityData, markers} = this.state

        // NEW CITIES? -> LOOP FOR NEW CITIES -> REQUEST MARKERS AND WEATHER
        if (citiesCount > markersCount) {

            // GET CITIES ID LIST
            const cityDataIds = cityData.map(i => i.id)

            // GET MARKERS ID LIST
            const markersIds = markers.map(i => i.id)

            // GET NEW IDS FROM CITIES ARRAY
            const newIds = cityDataIds.filter(i => markersIds.indexOf(i) === -1)

            // ITERATE ONLY NEW IDS/CITIES AND REQUEST THEIR COORDINATES
            newIds.length > 0 && newIds.map(i => {
                this._getCoordinatesFromAddress(cityData[i].cityName, cityData[i].dateArrival.seconds, cityData[i].id, 'add')
            })
        } else if (citiesCount === markersCount) {
            // GET CITIES NAME LIST
            const cityDataCities = cityData.map(i => i.cityName)

            // GET MARKERS CITY NAME LIST
            const markersCities = markers.map(i => i.cityName)

            // GET NEW IDS FROM CITIES ARRAY
            const newCities = cityDataCities.filter(i => markersCities.indexOf(i) === -1)

            // ITERATE ONLY NEW IDS/CITIES AND REQUEST THEIR COORDINATES
            newCities.length > 0 && newCities.map(cityName => {
                this._getCoordinatesFromAddress(
                    cityName,
                    cityData.filter(i => i.cityName === cityName)[0]['dateArrival']['seconds'],
                    cityData.filter(i => i.cityName === cityName)[0]['id'],
                    'replace'
                )
            })
        } else {
            cityData.forEach((item, index) => {
                // WEATHER NOT EMPTY
                if (!weatherDataEmpty) {
                    // UP-TO-DATE WEATHER CHECKING
                    this._handleWeatherData(index, item)
                } else {
                    // WEATHER & MARKERS EMPTY - REQUEST BOTH
                    this._getCoordinatesFromAddress(item.cityName, item.dateArrival.seconds, item.id, 'add')
                }
            })
        }
    }

    _requestMarkersAndWeather = () => {
        const {cityData, markers, weatherData} = this.state
        let citiesCount = cityData.length
        let markersCount = markers.length

        let markersEmpty = markersCount === 0
        let weatherDataEmpty = weatherData.length === 0


        // MARKERS EMPTY
        if (markersEmpty || citiesCount > markersCount || citiesCount === markersCount) {
            // MARKERS EMPTY - REQUEST MARKERS & WEATHER
            this._getMarkersAndWeatherFromCities(citiesCount, markersCount, weatherDataEmpty)
        } else {
            // MARKERS NOT EMPTY, WEATHER EMPTY - REQUEST WEATHER
            this._getWeatherFromMarkers()
        }

        this._addToFavorites(cityData)
    }

    componentWillMount() {
        this.props.fetchAllCityData()
    }

    componentDidMount() {
        this._requestMarkersAndWeather()
    }

    render() {

        const {size, txtBack, title, weatherData} = this.state

        return (
            <>
                <Header breadcrumbReviewData/>
                <Row type="flex" justify="space-around" align="middle" className="container-row">
                    <Col className="container-cell">
                        <Row type="flex" justify="space-between" align="middle"
                             style={{padding: '0 15px', minWidth: 500}}>
                            <Col span={8} className="l-align-to-child">
                                <Button shape="circle" size={size}
                                        onClick={() => this.props.history.push('/')}>
                                    <Icon type="left" className="circle-button"/>
                                </Button>
                                <span className="fs16 city-prev-button-text">{txtBack}</span>
                            </Col>
                            <Col span={8}>
                                <div className="fs24 view-title">{title}</div>
                            </Col>
                            <Col span={8}>{''}</Col>
                        </Row>
                        <Row gutter={{xs: 16, lg: 24}} type="flex" justify="center">
                            {this.props.cityData.map((data, key) => <CityDataReview key={key} cityDatas={data}/>)}
                        </Row>
                        <div className="btn-block">
                            <Button
                                disabled={weatherData.length === 0}
                                loading={weatherData.length === 0}
                                className="button"
                                size="large"
                                onClick={this._redirectToMap}>Confirm this data</Button>
                        </div>
                    </Col>
                </Row>
            </>
        )
    }
}

function mapStateToProps(state) {
    return {
        cityData: state.cityDataStore.cityData,
        loading: state.cityDataStore.loading,
        errors: state.cityDataStore.errors
    }
}

export default connect(mapStateToProps, {saveCityData, fetchAllCityData})(ReviewCityData)