import React from 'react'
import {GoogleMap, withGoogleMap, withScriptjs} from "react-google-maps"
import {compose, lifecycle, withProps, withStateHandlers} from "recompose"
//import { withRouter } from 'react-router-dom'

import {Icon, Drawer} from 'antd'
import {MarkerWithLabel} from "react-google-maps/lib/components/addons/MarkerWithLabel"

import * as URLS from '../../constants/urls'
import {getFirebaseDate, tempUnit, temperatureToShow, dateFormat} from '../../constants/utilities'

import CityResults from '../CitiesSelect/CityResults'

const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1619267_zrippa67shf.js',
})


const MapContainer = compose(
    withProps({
        googleMapURL: `${URLS.URL_GOOGLE_MAPS_LIBRARIES}`,
        loadingElement: <div style={{height: `100%`}}/>,
        containerElement: <div style={{height: `100%`}}/>,
        mapElement: <div id="map" style={{height: `100%`}}/>,
        center: {lat: 40.809139, lng: 14.6203533}
    }),

    withStateHandlers(() => ({
        isOpen: false,
        idMarkerShown: 0
    }), {
        onToggleOpen: ({isOpen}) => (id) => ({
            isOpen: !isOpen,
            idMarkerShown: id
        })
    }),
    lifecycle({
        componentDidMount() {

            const refs = {}

            this.setState({
                markersDef: this.props.markers && JSON.parse(JSON.stringify(this.props.markers)),
                centerNew: {lat: 40.809139, lng: 14.6203533},
                zoomLevel: 15,
                onMapMounted: ref => {
                    refs.map = ref

                    if (Object.values(this.props.markers).length > 0) {
                        let objectsBounds = new google.maps.LatLngBounds()

                        Object.values(this.props.markers).map((marker) => {
                            if (marker.lat !== 0 && marker.lng !== 0) {
                                let lat = parseFloat(marker.lat)
                                let lng = parseFloat(marker.lng)
                                let point = new google.maps.LatLng(lat, lng)
                                objectsBounds.extend(point)
                            }
                        })

                        if (refs.map) {
                            refs.map.fitBounds(objectsBounds)
                        }
                    }
                },

                /*onInfoWindowDomReady: () => {
                    this.props.isOpen ? this.state.onAutozoomToggle(false) : this.state.onAutozoomToggle(true)
                }*/
            })
            //console.debug('Main Google Map was mounted...')
        },

        componentWillReceiveProps(nextProps) {

        },

        componentWillUnmount() {
            //console.debug('Main Google Map was unmounted...')
        }
    }),
    withScriptjs,
    withGoogleMap
)(props =>

    <GoogleMap
        ref={props.onMapMounted}
        defaultZoom={8}
        defaultCenter={{lat: 40.809139, lng: 14.6203533}}
    >
        {
            props.markers.map((marker, key) => {
                const dateArrival = getFirebaseDate(props.cityData[key].dateArrival.seconds, dateFormat('mapOverview'))

                /** @namespace google.maps */
                const markerIcon = {
                    //url: 'http://image.flaticon.com/icons/svg/252/252025.svg',
                    url: '../../images/marker.png',
                    scaledSize: new google.maps.Size(40, 40),
                    origin: new google.maps.Point(0, 0),
                    labelOrigin: new google.maps.Point(0, 0)
                }

                const minTemp = parseInt(props.weatherData[key]['daily'].data[0].temperatureLow)
                const maxTemp = parseInt(props.weatherData[key]['daily'].data[0].temperatureHigh)


                const newMinTemp = temperatureToShow(minTemp)
                const newMaxTemp = temperatureToShow(maxTemp)

                const tempToShow = newMinTemp === newMaxTemp ? newMinTemp : `${newMinTemp}°${tempUnit()}  |  ${newMaxTemp}°${tempUnit()}`

                return (
                    <MarkerWithLabel
                        key={key}
                        position={{lat: parseFloat(marker.lat), lng: parseFloat(marker.lng)}}
                        labelAnchor={new google.maps.Point(-18, 48)}
                        icon={markerIcon}
                        labelClass="google-map-label"
                        labelInBackground={true}
                        onClick={() => {
                            props.onToggleOpen(key)/*
                            props.history.push({
                                pathname: '/city-results',
                                state: {
                                    id: marker.id,
                                    cityData: props.cityData[marker.id],
                                    weatherData: props.weatherData[marker.id],
                                    modalVisible: props.isOpen
                                }
                            })*/
                        }}
                    >
                        <div className="icons-list">
                            <div>
                                <div className="city-name">{props.cityData[key].cityName}</div>
                                <div className="date-arrival">{dateArrival}</div>
                            </div>
                            <IconFont className="weather-icon" type={`icon-${props.weatherData[key]['daily'].icon}`}/>
                            <div className="weather-temp">{tempToShow}</div>
                        </div>
                    </MarkerWithLabel>
                )
            })
        }
        {
            props.markersDef.map((marker, key) => {
                return (
                    <div key={marker.id}>
                        {
                            props.idMarkerShown === key &&
                            <Drawer
                                className="city-information"
                                title={<div className="text-center fs24">{`Enjoy ${props.cityData[key].cityName}`}</div>}
                                width="65%"
                                visible={props.isOpen}
                                onClose={() => props.onToggleOpen(key)}
                            >
                                <CityResults weatherData={props.weatherData[key]}
                                             cityData={props.cityData[key]}
                                             country={marker.country}/>
                            </Drawer>
                        }
                    </div>
                )
            })
        }
    </GoogleMap>
)

export default MapContainer