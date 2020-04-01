import React, {Component} from 'react'
import * as firebase from 'firebase'
import {Button, Col, DatePicker, Form, Icon, Input, Row, Popconfirm} from 'antd'
import Header from "../Header"
import locale from 'antd/lib/date-picker/locale/it_IT'
import moment from 'moment'
import TextLoop from "react-text-loop"
import {TransportIcons} from '../../constants/transportIcons'
import {getLocalVal, dateFormat} from "../../constants/utilities";

class TransportType extends Component {

    constructor(props) {
        super(props)

        this.state = {
            transportType: ["with airplane?", "on car?", "by train?"]
        }
    }

    _onHoverTransportIcon = (text) => {
        this.setState({
            transportType: [text]
        })
    }
    _onLeaveTransportIcon = () => {
        this.setState({
            transportType: ["with airplane?", "on car?", "by train?"]
        })
    }

    render() {

        const {transportType} = this.state
        const {transportTypeSelected} = this.props

        return (
            <Form.Item>
                {
                    transportTypeSelected === 0 &&
                    <span className="fs16 pointer" style={{lineHeight: 2.8}}>
                        Will you go{" "}
                        {
                            transportType.length === 1 ? transportType :
                                <TextLoop className="fs16"
                                          interval={2000}
                                          springConfig={{stiffness: 180, damping: 8}}
                                          children={transportType}
                                />
                        }
                    </span>
                }
                <TransportIcons
                    transportTypeSelected={this.props.transportTypeSelected}
                    _onToggleTransport={this.props._onToggleTransport}
                    _onHoverTransportIcon={this._onHoverTransportIcon}
                    _onLeaveTransportIcon={this._onLeaveTransportIcon}
                />
            </Form.Item>
        )
    }
}


class CityData extends Component {

    constructor(props) {
        super(props)

        const cityData = this.props.cityData || []

        this.state = {
            title: `Insert your ${this.props.viewCount + 1} city to visit`,
            size: 'large',
            txtNext: 'Next city',
            txtPrev: 'Previous city',
            viewCityName: cityData[this.props.viewCount] ? cityData[this.props.viewCount].cityName : '',
            viewDateArrivalStr: cityData[this.props.viewCount] ? moment.unix(cityData[this.props.viewCount].dateArrival.seconds) : null,
            viewDateArrivalObj: cityData[this.props.viewCount] ? cityData[this.props.viewCount].dateArrival : null,
            transportTypeSelected: cityData[this.props.viewCount] ? cityData[this.props.viewCount].transportTypeSelected : 0
        }
    }

    _removeCityDataLocally = () => {
        let cityDataArr = getLocalVal('cityDataArr', null)

        let cityDataCleared = cityDataArr.cityData.filter(i => i.id !== this.props.viewCount)
        let markersCleared = cityDataArr.markers.filter(i => i.id !== this.props.viewCount)
        let weatherDataCleared = cityDataArr.weatherData.filter(i => i.id !== this.props.viewCount)
        const cityDataLocalStorage = {
            cityData: cityDataCleared,
            markers: markersCleared,
            weatherData: weatherDataCleared
        }
        window.localStorage.setItem('cityDataArr', JSON.stringify(cityDataLocalStorage))
    }

    _checkDataEmptiness = () => {
        if (!this.state.viewCityName && !this.state.viewDateArrivalObj) {
            this._onToggleTransport(0)
            this._removeCityDataLocally()
        }
    }

    _onChangeDate = (date, dateString = {}) => {
        if (dateString === '') dateString = null

        this.setState({
            viewDateArrivalStr: dateString && moment(dateString),
            viewDateArrivalObj: firebase.firestore.Timestamp.fromDate(new Date(date))
        }, () => this._checkDataEmptiness())
    }

    _onChangeCity = (e) => {
        this.setState({
            viewCityName: e.target.value
        }, () => this._checkDataEmptiness())
    }

    _onToggleTransport = (type) => {
        this.setState((prevState) => ({
            transportTypeSelected: prevState.transportTypeSelected === type ? 0 : type
        }))
    }

    _disabledDate = (current) => {
        // Can not select days before today and today
        //return current && current.valueOf() < Date.now()
        return moment().add(-1, 'days')  >= current
    }

    render() {

        const {viewCityName, viewDateArrivalObj, viewDateArrivalStr, transportTypeSelected, size, txtPrev, txtNext, title} = this.state
        const currentIterator = this.props.viewCount

        return (this.props.shown === 1) ?
            <>
                <Header breadcrumbCityData/>
                <Row type="flex" justify="space-around" align="middle" className="container-row">
                    <Col>
                        <Button type="primary" shape="circle" size={size}
                                onClick={() => this.props._slideCity(viewCityName, viewDateArrivalObj, transportTypeSelected, currentIterator, 'prev')}
                                disabled={this.props.viewCount <= 0}>
                            <Icon type="left" className="circle-button"/>
                        </Button>
                        <span className="fs16 city-prev-button-text">{txtPrev}</span>
                    </Col>
                    <Col className="container-cell">
                        <div className="fs24 view-title">{title}</div>
                        <Form className="city-data-form">
                            <Form.Item>
                                <Input value={viewCityName} size={size} className="input"
                                       placeholder="Your city" allowClear={true} onChange={this._onChangeCity}
                                />
                            </Form.Item>
                            <Form.Item>
                                <DatePicker
                                    disabledDate={this._disabledDate}
                                    locale={locale}
                                    format={dateFormat('citiesData')}
                                    onChange={this._onChangeDate}
                                    size={size}
                                    className="input"
                                    value={viewDateArrivalStr}
                                    defaultValue={viewDateArrivalStr}
                                    placeholder="Your departure date"/>
                            </Form.Item>
                            <TransportType transportTypeSelected={transportTypeSelected} _onToggleTransport={this._onToggleTransport}/>
                        </Form>
                        <div className="btn-block">
                            {/*<div className="fs12 muted-text">Did you've entered <br/> all the cities you'd like to visit?</div>*/}
                            <Popconfirm
                                title={"Did you've entered all the cities you'd like to visit?"}
                                icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                                onConfirm={
                                    () => this.props._proceedToReview(
                                        viewCityName,
                                        viewDateArrivalObj,
                                        transportTypeSelected,
                                        currentIterator
                                    )
                                }
                            >
                                <Button className="button" size={size}>Let's go</Button>
                            </Popconfirm>
                        </div>
                    </Col>
                    <Col>
                        <span className="fs16 city-next-button-text">{txtNext}</span>
                        <Button type="primary" shape="circle" size={size}
                                onClick={() => this.props._slideCity(viewCityName, viewDateArrivalObj, transportTypeSelected, currentIterator, 'next')}
                        >
                            <Icon type="right" className="circle-button"/>
                        </Button>
                    </Col>
                </Row>
            </>
            : null
    }
}

export default CityData