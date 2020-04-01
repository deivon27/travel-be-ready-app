import React, {Component} from 'react'
import {Select, Col, Divider, Row, Switch, Popover, Button, DatePicker, Card} from 'antd'
import {_renderSection, camelCaseToHumanReadeable, getLocalVal} from "../constants/utilities"
import locale from "antd/lib/date-picker/locale/it_IT"
import moment from "moment"

import Header from "./Header"
import Music from "./Music"

const imagesPath = '../../images/settings-date-formats/'

const dateFormatsPatterns = [
    'YYYY-MM-DD',
    'dddd, MMM D',
    'DD MMMM YYYY',
    'DD MMM YY',
    'MMM Do YYYY',
    'MMMM Do YYYY'
]


export default class Settings extends Component {

    state = {
        tempUnit: getLocalVal('tempUnit', false),
        distanceUnit: getLocalVal('distanceUnit', false),
        dateFormats: getLocalVal('dateFormats', {}),
        currencyTo: getLocalVal('currencyTo', 'USD', false),
        language: getLocalVal('language', 'en', false),
        gender: getLocalVal('gender', 'na', false),
        dob: !getLocalVal('dob', null, false) ? null : moment(getLocalVal('dob', null, false)),
        googleAddressLinks: getLocalVal('googleAddressLinks', false)
    }

    /** TO-DO: optimize the methods in just one **/
    /*_setTempUnit = value => {
        this.setState({
            tempUnit: value
        }, () => {
            window.localStorage.setItem('tempUnit', value)
        })
    }

    _setDistanceUnit = value => {
        this.setState({
            distanceUnit: value
        }, () => {
            window.localStorage.setItem('distanceUnit', value)
        })
    }

    _setCurrency = value => {
        this.setState({
            currencyTo: value
        }, () => {
            window.localStorage.setItem('currencyTo', value)
        })
    }

    _setLanguage = value => {
        this.setState({
            language: value
        }, () => {
            window.localStorage.setItem('language', value)
        })
    }

    _setGender = value => {
        this.setState({
            gender: value
        }, () => {
            window.localStorage.setItem('gender', value)
        })
    }*/

    _setDateFormat = (value, key) => {
        const dateFormats = this.state.dateFormats
        dateFormats[key] = value

        this.setState({
            dateFormats: dateFormats
        }, () => {
            window.localStorage.setItem('dateFormats', JSON.stringify(dateFormats))
        })
    }

    _setDob = (date, dateString = {}) => {
        if (dateString === '') dateString = null

        this._onChangeParams('dob', moment(dateString))

        /*this.setState({
            dob: moment(dateString).format("YYYY-MM-DD")
        }, () => {
            window.localStorage.setItem('dob', moment(dateString))
        })*/
    }

    _onChangeParams = (name, value) => {
        this.setState({[name]: value}, () => {
            // Save parameter in Local Storage
            window.localStorage.setItem(`${name}`, value)
        })
    }

    _renderPreviewPopover = (name, nameReadeable, screenName = '') => {
        return (
            <Popover placement="leftTop"
                     title={`${nameReadeable} screen`}
                     trigger="hover"
                     content={<img className="settings-img" src={`${imagesPath}${name}.jpg`} alt={`${name} image`}/>}
            >
                <Button type="link" className="fs14 mrgn-r-10 padding-reset">{`${nameReadeable} ${screenName && `in ${screenName}`} screen:`}</Button>
            </Popover>
        )
    }

    _renderDateFormatSection = name => {
        const {dateFormats} = this.state

        const dateFormatsValues = [
            '2020-03-28',
            'Tuesday, Mar 28',
            '28 March 2020',
            '28 Mar 20',
            'Mar 28th 2020',
            'March 28st 2020'
        ]

        const nameReadeable = camelCaseToHumanReadeable(name)
        const placeholder = "Select format..."

        return (
            <Row className="mrgn-t-10">
                <Col span={12}>
                    {this._renderPreviewPopover(name, nameReadeable)}

                    {/*<Popover placement="leftTop" title={nameReadeable} trigger="hover"
                             content={<img className="settings-img" src={`${imagesPath}${name}.jpg`} alt={`${name} image`}/>}>
                        <Button type="link" className="fs14 mrgn-r-10">{nameReadeable} in {screenName} screen:</Button>
                    </Popover>*/}
                </Col>
                <Col span={12} className="text-right">
                    <Select defaultValue={dateFormats[name] || placeholder}
                            className="settings-form-input"
                            placeholder={placeholder}
                            onChange={value => this._setDateFormat(value, name)}
                    >
                        {dateFormatsValues.map((item, key) => {
                            return <Select.Option key={key} value={dateFormatsPatterns[key]}>{item}</Select.Option>
                        })}
                    </Select>
                </Col>
            </Row>
        )
    }

    render() {

        const {tempUnit, distanceUnit, currencyTo, language, gender, dob, googleAddressLinks} = this.state

        /** UNITS AND FORMATS SETTINGS **/
        const unitsAndFormatsBlock = (
            <div className="mrgn-l-25 mrgn-t-10">
                <Row className="mrgn-t-10">
                    <Col span={12}>
                        <div className="italic">Temperature:</div>
                    </Col>
                    <Col span={12} className="text-right">
                        <Switch checkedChildren="Celsius"
                                unCheckedChildren="Fahrenheit"
                                defaultChecked={tempUnit}
                                onClick={value => this._onChangeParams('tempUnit', value)}
                        />
                    </Col>
                </Row>
                <Row className="mrgn-t-10">
                    <Col span={12}>
                        <div className="italic">Distance:</div>
                    </Col>
                    <Col span={12} className="text-right">
                        <Switch checkedChildren="Metric"
                                unCheckedChildren="Imperial"
                                defaultChecked={distanceUnit}
                                onClick={value => this._onChangeParams('distanceUnit', value)}
                        />
                    </Col>
                </Row>
                <Row className="mrgn-t-10">
                    <Col>
                        <div className="italic">Date format:</div>
                    </Col>
                </Row>
                <div className="mrgn-l-10">
                    {this._renderDateFormatSection('citiesData')}
                    {this._renderDateFormatSection('cityResults')}
                    {this._renderDateFormatSection('favoriteCities')}
                    {this._renderDateFormatSection('favoriteRentalBookPeriod')}
                    {this._renderDateFormatSection('mapOverview')}
                    {this._renderDateFormatSection('reviewData')}
                    {this._renderDateFormatSection('weatherWidget')}
                </div>
                <Divider dashed/>
            </div>
        )

        /** LOCALIZATION SETTINGS **/

        const currencies = ['USD', 'EUR', 'RUB']
        const languages = {en: 'English', it: 'Italiano', ru: 'Русский'}

        const localizationBlock = (
            <div className="mrgn-l-25">
                <Row className="mrgn-t-10">
                    <Col span={12}>
                        <div className="italic">Currency:</div>
                    </Col>
                    <Col span={12} className="text-right">
                        <Select defaultValue={currencyTo}
                                className="settings-form-input" onChange={value => this._onChangeParams('currencyTo', value)}>
                            {currencies.map((item, key) => {
                                return <Select.Option key={key} value={item}>{item}</Select.Option>
                            })}
                        </Select>
                    </Col>
                </Row>
                <Row className="mrgn-t-10">
                    <Col span={12}>
                        <div className="italic">Language:</div>
                    </Col>
                    <Col span={12} className="text-right">
                        <Select defaultValue={language} className="settings-form-input" onChange={value => this._onChangeParams('language', value)}>
                            {Object.keys(languages).map((item, key) => {
                                return <Select.Option key={key} value={item}>{languages[item]}</Select.Option>
                            })}
                        </Select>
                    </Col>
                </Row>
                <Divider dashed/>
            </div>
        )

        /** LOCALIZATION SETTINGS **/
        const userSettingsBlock = (
            <div className="mrgn-l-25">
                <Row className="mrgn-t-10">
                    <Col span={12}>
                        <div className="italic">Gender:</div>
                    </Col>
                    <Col span={12} className="text-right">
                        <Select defaultValue={gender} className="settings-form-input" onChange={value => this._onChangeParams('gender', value)}>
                            <Select.Option key={1} value="m">Male</Select.Option>
                            <Select.Option key={2} value="f">Female</Select.Option>
                            <Select.Option key={3} value="na">Not specified</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row className="mrgn-t-10">
                    <Col span={12}>
                        <div className="italic">Date of birth:</div>
                    </Col>
                    <Col span={12} className="text-right">
                        <DatePicker
                            locale={locale}
                            format="YYYY-MM-DD"
                            className="input settings-form-input"
                            value={dob}
                            defaultValue={dob}
                            placeholder="Date of birth"
                            onChange={this._setDob}
                            allowClear={false}
                        />
                    </Col>
                </Row>
                <Divider dashed/>
            </div>
        )

        /** OTHER SETTINGS **/
        const name = "googleLinks"
        const nameReadeable = camelCaseToHumanReadeable(name)

        const otherSettingsBlock = (
            <div className="mrgn-l-25">
                <Row className="mrgn-t-10">
                    <Col span={12}>
                        {this._renderPreviewPopover(name, nameReadeable, "Hotel")}
                    </Col>
                    <Col span={12} className="text-right">
                        <Switch checkedChildren="yes"
                                unCheckedChildren="no"
                                defaultChecked={googleAddressLinks}
                                onClick={value => this._onChangeParams('googleAddressLinks', value)}
                        />
                    </Col>
                </Row>
                {/*<Row className="mrgn-t-10">
                    <Divider dashed/>
                    <Col>
                        <div className="italic">Music on background:</div>
                    </Col>
                </Row>
                <Row className="mrgn-t-10">
                    <Col>
                        <Music/>
                    </Col>
                </Row>*/}
            </div>
        )

        return (
            <>
                <Header breadcrumbSettings/>
                <Row type="flex" justify="space-around" align="middle" className="settings">
                    <Col span={8}>
                        <div className="fs24 view-title mrgn-tb-20 text-center">Settings</div>
                        <Row type="flex" justify="space-between" align="middle">
                            <Col span={24} className="text-left">
                                <Card className="mrgn-tb-5 padding30 music-player-bg">
                                    {_renderSection('deployment-unit', 'Units and formats', unitsAndFormatsBlock)}
                                    {_renderSection('global', 'Localization settings', localizationBlock)}
                                    {_renderSection('user', 'User settings', userSettingsBlock)}
                                    {_renderSection('block', 'Other settings', otherSettingsBlock)}
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        )
    }
}