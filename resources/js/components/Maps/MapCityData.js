import React, {Component} from 'react'
import {Col, Row} from 'antd'

import MapContainer from './MapContainer'
import Header from "../Header"

import {getLocalVal} from '../../constants/utilities'


export default class MapCityData extends Component {

    constructor(props) {
        super(props)
        this.cityDataArr = getLocalVal('cityDataArr', [])
    }

    render() {

        let props = !this.props.location.state ? this.cityDataArr : this.props.location.state
        return (
            <>
                <Header breadcrumbMap />
                <Row type="flex" className="content-wrapper">
                    <Col span={24} style={{height: '100%'}}>
                        <MapContainer {...props} />
                    </Col>
                </Row>
            </>
        )
    }
}