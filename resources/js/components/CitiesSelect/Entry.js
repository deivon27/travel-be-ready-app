import React from 'react'
import {connect} from 'react-redux'

import {saveCityData} from '../../actions/cityData-actions'
import {getLocalVal} from '../../constants/utilities'

import CityData from './CityData'


class Entry extends React.PureComponent {

    constructor(props) {
        super(props)

        const cityDataArr = getLocalVal('cityDataArr', [])

        this.state = {
            viewCount: 0,
            cityData: cityDataArr && cityDataArr['cityData'],
            isGeocodingError: false
        }

        /* Create array with city data */
        this.cityDataArr = cityDataArr
        this.cityData = cityDataArr['cityData'] || []
    }

    _slideCity = (cityName, dateArrival, transportTypeSelected, i, direction) => {
        /**
         * TO-DO Check out the stability of checking data
         */
        if (cityName && dateArrival && !transportTypeSelected) {
            alert("Select transport")
        } else {

            /* Set state with viewCount decrement */
            this.setState(prevState => ({
                    viewCount: direction === 'next' ? prevState.viewCount + 1 : prevState.viewCount - 1
                }), () => this._checkData(cityName, dateArrival, transportTypeSelected, i)
            )
        }
    }

    _checkData = async (cityName, dateArrival, transportTypeSelected, i) => {
        console.log(this.state)
        if (cityName && dateArrival && transportTypeSelected) {
            let data = {
                id: i,
                cityName: cityName,
                dateArrival: dateArrival,
                transportTypeSelected: transportTypeSelected
            }

            /* Proceed only if cityDataArr array not contains input data */
            if (this.cityData.filter(item => {
                    return item.cityName === cityName &&
                        item.dateArrival.seconds === dateArrival.seconds &&
                        item.transportTypeSelected === transportTypeSelected
                }).length === 0) {

                /* If cityDataArr array contains record of current view */
                if (this.cityData[i]) {
                    const newArray = Object.assign([], this.cityData, {
                        [i]: data
                    })

                    /* Save input data */
                    this._writeData(newArray)
                }

                /* If cityDataArr NOT contains record of current view */
                else {

                    /* Add new input data to cityDataArr array */
                    this.cityData.push(data)

                    /* Save input data */
                    this._writeData(this.cityData)
                }
            }
        } else {
            // Remove the iterated object
            const newCityData = this.cityData.filter(obj => obj.id !== i)
            this.cityData = newCityData
            this.cityDataArr.markers = this.cityDataArr.markers.filter(obj => obj.id !== i)
            this.cityDataArr.weatherData = this.cityDataArr.weatherData.filter(obj => obj.id !== i)

            /* Save input data */
            this._writeData(newCityData)
        }
    }

    _proceedToReview = (cityName, dateArrival, transportTypeSelected, i) => {

        /* Check inserted data only if all fields were filled in */
        (cityName && dateArrival && transportTypeSelected) &&
        this._checkData(cityName, dateArrival, transportTypeSelected, i).then(() => {
            /* Navigate to Review Data view */
            this.props.history.push('/review-data')
        })
    }

    _writeData = (cityData) => {

        /* Save input data in state */
        this.setState({
            cityData: cityData
        }, () => {

            /* Save input data in Redux Store */
            this.state.cityData.length > 0 &&
            this.props.saveCityData(this.state.cityData)

            /* Prepare data structure for Local Storage */
            const cityDataLocalStorage = {
                cityData: this.state.cityData,
                markers: this.cityDataArr.markers || [],
                weatherData: this.cityDataArr.weatherData || []
            }

            /* Save input data in Local Storage */
            window.localStorage.setItem('cityDataArr', JSON.stringify(cityDataLocalStorage))
        })
    }

    componentWillMount() {
        this.state.cityData && this.props.saveCityData(this.state.cityData)
    }

    render() {

        const {viewCount, cityData} = this.state

        const initCityData = {
            _slideCity: this._slideCity,
            _proceedToReview: this._proceedToReview,
            cityData: cityData
        }

        let views = []

        for (let i = 0; i <= viewCount; i++) {
            views.push(<CityData {...initCityData} key={i} viewCount={i} shown={viewCount !== i ? 0 : 1}/>)
        }

        return views
    }
}

function mapStateToProps(state) {
    return {
        cityData: state.cityDataStore.cityData,
        loading: state.cityDataStore.loading,
        errors: state.cityDataStore.errors
    }
}

export default connect(mapStateToProps, {saveCityData})(Entry)