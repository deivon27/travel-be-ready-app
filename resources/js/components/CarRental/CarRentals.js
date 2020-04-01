import React, {Component} from 'react'
import {Col, DatePicker, Form, Layout, Row, Select, Icon, Empty, Spin, Input, Tooltip, InputNumber, Divider} from 'antd'

import locale from "antd/lib/date-picker/locale/it_IT"
import Header from "../Header"
import CarRentalItem from "./CarRentalItem"
import {callApi, getLocalVal, showNotification, _convertCurrencyTextToSymbol} from '../../constants/utilities'
import * as firestore from "../../services/firebase"
import * as URLS from "../../constants/urls"
import moment from 'moment'

const {Sider, Content} = Layout


export default class CarRentals extends Component {

    constructor(props) {
        super(props)
        const openSections = {}
        this.state = {
            vehicles: getLocalVal('vehicles', null),
            transactionId: getLocalVal('vehicles', null)['transaction']['transaction_id'],
            selectedLocation: getLocalVal('selectedLocation', {}),
            brands: ['Avis', 'Budget', 'Payless'],
            accessToken: getLocalVal('vehiclesAccessToken', null, false),
            error: '',
            vehiclesListLoading: true,
            qtyDays: 1,
            pickupDate: null,
            dropoffDate: null,
            brandFilter: getLocalVal('brandFilter', null, false),
            ageFilter: getLocalVal('ageFilter', null, false),
            dobFilter: null,
            dobFilterValue: !getLocalVal('dob', null, false) ? null : moment(getLocalVal('dob', null, false)),
            membershipCodeFilter: getLocalVal('membershipCodeFilter', null, false),
            discountCodeFilter: getLocalVal('discountCodeFilter', null, false),
            couponCodeFilter: getLocalVal('couponCodeFilter', null, false),
            iataNumberFilter: getLocalVal('iataNumberFilter', null, false),
            currencyFrom: 'USD',
            currencyTo: getLocalVal('currencyTo', null, false),
            currencyFromToKey: '',
            currencyConvertedResult: 0,
            currencySymbol: '$',
            orderFilter: 'relevant',
            openSections
        }
    }

    _toggleMoreData = (id) => {
        const {openSections} = this.state
        const isOpen = !!openSections[id]

        this.setState({
            openSections: {[id]: !isOpen}
        })
    }

    _getAccessToken = async () => {

        const url = URLS.URL_VEHICLES_AUTH

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'client_id': URLS.URL_VEHICLES_CLIENT_ID,
            'client_secret': URLS.URL_VEHICLES_CLIENT_SECRET
        }

        const response = await callApi({}, 'GET', headers, url)
        window.localStorage.setItem('vehiclesAccessToken', response.access_token)
        return response.access_token
    }

    _getCarRentals = async (accessToken) => {

        const url = URLS.URL_VEHICLES
        const {selectedLocation, brandFilter, qtyDays, ageFilter, dobFilter, membershipCodeFilter, discountCodeFilter, couponCodeFilter, iataNumberFilter} = this.state

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'client_id': URLS.URL_VEHICLES_CLIENT_ID,
            'Authorization': `Bearer ${accessToken ? accessToken : this.state.accessToken}`
        }

        /** TO-DO: change to the real dropoff date **/
        const pickupDate = moment.unix(selectedLocation.dateArrival).format()
        const dropoffDate = moment.unix(selectedLocation.dateArrival).add(qtyDays, 'days').format()

        const apiParamsObject = {
            'brand': brandFilter,
            'pickup_date': pickupDate,
            'pickup_location': 'EWR',
            'dropoff_date': dropoffDate,
            'dropoff_location': 'EWR',
        }

        const apiParams = (key) => {
            if (key === 'country_code') apiParamsObject[key] = selectedLocation.country
            if (ageFilter && key === 'age') apiParamsObject[key] = ageFilter
            if (dobFilter && key === 'date_of_birth') apiParamsObject[key] = dobFilter
            if (membershipCodeFilter && key === 'membership_code') apiParamsObject[key] = membershipCodeFilter
            if (discountCodeFilter && key === 'discount_code') apiParamsObject[key] = discountCodeFilter
            if (couponCodeFilter && key === 'coupon_code') apiParamsObject[key] = couponCodeFilter
            if (iataNumberFilter && key === 'iata_number') apiParamsObject[key] = iataNumberFilter

            return apiParamsObject
        }

        const apiParamsArray = ['country_code', 'age', 'date_of_birth', 'membership_code', 'discount_code', 'coupon_code', 'iata_number']
        apiParamsArray.map(item => apiParams(item))


        const response = await callApi(apiParamsObject, 'GET', headers, url)

        console.info('_getCarRentals: ')
        console.info(response)

        if (response.error === 'invalid_grant') {
            this.setState({accessToken: null})
        } else if (response.error === 'invalid_client') {
            this.setState({
                vehicles: getLocalVal('vehicles', null),
                vehiclesListLoading: false
            })
        } else if (response.status.errors) {
            this.setState({
                error: response.status.errors[0],
                vehicles: null,
                vehiclesListLoading: false
            }, () => {
                showNotification('Car rentals list', response.status.errors[0], 'error')
            })
        } else {
            this.setState({
                vehicles: response,
                transactionId: response['transaction']['transaction_id'],
                currencyFrom: response['vehicles'][0]['rate_totals']['rate']['currency'],
                vehiclesListLoading: false
            }, () => {
                window.localStorage.setItem('vehicles', JSON.stringify(response))
            })
        }

        return response
    }


    _addNewCarRentListToFirestore = (carRentalsRef, cityName, vehicles) => {

        carRentalsRef.set({vehicles: vehicles}, {merge: true})
            .then(() => {
                console.info(`New vehicles list was successfully added in ${cityName}!`)
            })
            .catch(err => {
                console.error("Query failed: ", err)
            })
    }

    _addCarRentalsCacheToFirestore = (vehicles, cityName) => {
        // Create a reference to the carRentals collection
        const carRentalsRef = firestore.connect.collection('carRentalsCache').doc(cityName)

        carRentalsRef.get().then(doc => {

            // CITY EXISTS - ADD NEW CAR RENTAL LIST
            if (doc.exists) {
                console.info(`City ${cityName} is already exists`)

                let vehiclesRef = doc.data()

                // CAR RENTAL LIST DOESN'T EXIST - ADD
                if (!vehiclesRef.vehicles)
                    this._addNewCarRentListToFirestore(carRentalsRef, cityName, vehicles)

                // CAR RENTAL LIST EXISTS - VOID
                else {
                    this.setState({
                        vehiclesListLoading: false
                    }, () => Promise.reject(`Locations list in ${cityName} just exists.`))
                }

            }
            // CITY DOESN'T EXIST - CREATE NEW CITY AND CAR RENTAL LIST
            else
                this._addNewCarRentListToFirestore(carRentalsRef, cityName, vehicles)
        }).catch(error => {
            console.error("Error getting document of the city: ", error)
        })
    }


    /**
     * Pickup date input onchange trigger
     * @param date
     * @param dateString
     * @private
     */
    _onChangePickupDate = (date, dateString = {}) => {
        if (dateString === '') dateString = null

        this.setState({
            pickupDate: moment(dateString),
            qtyDays: Number(moment.duration(moment(dateString, "YYYY-MM-DD").diff(this.state.dropoffDate)).asDays())
        })
    }

    /**
     * Dropoff date input onchange trigger
     * @param date
     * @param dateString
     * @private
     */
    _onChangeDropoffDate = (date, dateString = {}) => {
        if (dateString === '') dateString = null

        this.setState({
            dropoffDate: moment(dateString),
            qtyDays: Number(moment.duration(moment(dateString, "YYYY-MM-DD").diff(this.state.pickupDate)).asDays())
        }/*, () => this._getCarRentals()*/)
    }

    /**
     * Car rental brand input onchange trigger
     * @param value
     * @private
     */
    _onChangeBrandFilter = value => {
        this._onChangeParams('brandFilter', value)
        return this._getCarRentals()
    }

    /**
     * Driver's age input onchange trigger
     * @private
     * @param value
     */
    _onChangeAgeFilter = value => {
        this._onChangeParams('ageFilter', value)
    }

    /**
     * Driver's date of birth input onchange trigger
     * @param date
     * @param dateString
     * @private
     */
    _onChangeDobDateFilter = (date, dateString = {}) => {
        if (dateString === '') dateString = null

        this.setState({
            dobFilter: moment(dateString).format("YYYY-MM-DD")
        }, () => {
            this._onChangeParams('dob', moment(dateString))
            return this._getCarRentals()
        })
    }

    /**
     * Member code input onchange trigger
     * @param event
     * @private
     */
    _onChangeMemberCodeFilter = event => {
        this._onChangeParams('membershipCodeFilter', event.target.value)
    }

    /**
     * Discount code input onchange trigger
     * @param event
     * @private
     */
    _onChangeDiscountCodeFilter = event => {
        this._onChangeParams('discountCodeFilter', event.target.value)
    }

    /**
     * Coupon input onchange trigger
     * @param event
     * @private
     */
    _onChangeCouponFilter = event => {
        this._onChangeParams('couponCodeFilter', event.target.value)
    }

    /**
     * IATA number input onchange trigger
     * @param event
     * @private
     */
    _onChangeIataFilter = event => {
        this._onChangeParams('iataNumberFilter', event.target.value)
    }


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
        this.setState({
            vehiclesListLoading: true
        }, () => this._getCarRentals())
    }

    _onChangeParams = (name, value) => {
        this.setState({[name]: value}, () => {
            // Save parameter in Local Storage
            window.localStorage.setItem(`${name}`, value)
        })
    }

    _onChangeOrderFilter = value => {
        this.setState({
            orderFilter: value
        }, () => {
            const vehiclesToSort = this.state.vehicles

            vehiclesToSort['vehicles'].sort((a, b) => {
                const priceToSortA = a['rate_totals']['pay_later']['reservation_total']
                const priceToSortB = b['rate_totals']['pay_later']['reservation_total']
                return value === 'lowPrice' ? priceToSortA && priceToSortA > priceToSortB : priceToSortA && priceToSortA < priceToSortB
            })

            this.setState({
                vehicles: vehiclesToSort
            })
        })
    }

    _infoTooltip = (title) => {
        return (
            <Tooltip
                placement="right"
                title={title}>
                <Icon type="info-circle" style={{color: 'rgba(0,0,0,.45)'}}/>
            </Tooltip>
        )
    }

    _disabledDate = (current) => {
        // Can not select days before today and today
        //return current && current.valueOf() < Date.now()
        return moment().add(-1, 'days') >= current
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.accessToken !== prevState.accessToken) {
            return this._getAccessToken().then((accessToken) => {
                return this._getCarRentals(accessToken)
            })
        }
    }

    componentDidMount() {
        const {selectedLocation, currencyFrom, qtyDays, currencyTo} = this.state

        this.setState({
            pickupDate: selectedLocation.dateArrival && moment.unix(selectedLocation.dateArrival),
            dropoffDate: selectedLocation.dateArrival && moment.unix(selectedLocation.dateArrival).add(qtyDays, 'days')
        })

        /**
         * Update of currency basing on saved filter selection
         */
        if (currencyFrom !== currencyTo) {
            this._onChangeCurrencyFilter(currencyTo)
        }

        /*if (this.state.accessToken) {
            return this._getCarRentals(this.state.accessToken)
        } else {
            return this._getAccessToken().then((accessToken) => {
                return this._getCarRentals(accessToken)
            })
        }*/

        console.log(this.state.vehicles)

        this._addCarRentalsCacheToFirestore(this.state.vehicles, selectedLocation.cityName)
    }

    componentDidCatch(error, info) {
        console.error(info.componentStack)
    }

    render() {

        const size = "default"
        const {
            selectedLocation,
            vehicles,
            transactionId,
            vehiclesListLoading,
            qtyDays,
            brands,
            pickupDate,
            dropoffDate,
            ageFilter,
            dobFilterValue,
            membershipCodeFilter,
            discountCodeFilter,
            couponCodeFilter,
            iataNumberFilter,
            currencyTo,
            currencyConvertedResult,
            currencySymbol,
            orderFilter,
            openSections
        } = this.state

        let contentToRender = ''

        if (vehiclesListLoading) {
            contentToRender = <div className="text-centered"><Spin size="large"/></div>
        } else {
            if (vehicles && vehicles['vehicles'].length > 0) {
                contentToRender = (
                    vehicles['vehicles'].map((vehicle, key) => {
                        return (
                            <Col key={key} xs={{span: 24}} md={{span: 24}} lg={{span: 24}} xl={{span: 12}} style={{position: 'relative'}}>
                                <CarRentalItem id={key}
                                               vehicle={vehicle}
                                               reservation={vehicles['reservation']}
                                               product={vehicles['product']}
                                               qtyDays={qtyDays}
                                               currencyConvertedResult={currencyConvertedResult}
                                               currencySymbol={currencySymbol}
                                               transactionId={transactionId}
                                               pickupDate={pickupDate}
                                               dropoffDate={dropoffDate}
                                               isMoreInfoOpen={!!openSections[key]}
                                               _toggleMoreData={this._toggleMoreData}
                                />
                            </Col>
                        )
                    })
                )
            } else {
                contentToRender = (
                    <Empty
                        image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
                        imageStyle={{height: 60}}
                        description={<span>No data available for selected filters</span>}
                    />
                )
            }
        }

        return (
            <>
                <Header breadcrumbCarRentals/>
                <Row type="flex" className="content-wrapper">
                    <Col span={24} style={{height: '100%'}}>
                        <Layout className="layout-car-rentals">
                            <Layout>
                                <Sider className="sider-car-rentals" theme={"light"} width={334}>
                                    <Form className="city-data-form">

                                        <Divider orientation="left text-red-800" dashed>Car rental related filters</Divider>

                                        <Form.Item label="Pick up date" colon className="form-item-car-rental mrgn-b-15">
                                            <DatePicker
                                                disabledDate={this._disabledDate}
                                                locale={locale}
                                                format="YYYY-MM-DD"
                                                size={size}
                                                className="input"
                                                value={pickupDate}
                                                defaultValue={pickupDate}
                                                placeholder="Pick up date"
                                                onChange={this._onChangePickupDate}
                                            />
                                        </Form.Item>

                                        <Form.Item label="Drop off date" colon className="mrgn-b-15">
                                            <DatePicker
                                                locale={locale}
                                                format="YYYY-MM-DD"
                                                size={size}
                                                className="input"
                                                value={dropoffDate}
                                                defaultValue={dropoffDate}
                                                placeholder="Drop off date"
                                                onChange={this._onChangeDropoffDate}
                                            />
                                        </Form.Item>

                                        <Form.Item label="Brand" colon className="mrgn-b-15">
                                            <Select defaultValue={brands[0]} size={size} onChange={this._onChangeBrandFilter}>
                                                {
                                                    brands && brands.map((item, key) => {
                                                        return <Select.Option key={key} value={item}>{item}</Select.Option>
                                                    })
                                                }
                                            </Select>
                                        </Form.Item>

                                        <Form.Item label="IATA number" colon className="mrgn-b-15">
                                            <Input
                                                allowClear
                                                name={'iataNumberFilter'}
                                                size={size}
                                                className="input"
                                                value={iataNumberFilter}
                                                defaultValue={iataNumberFilter}
                                                placeholder="IATA number"
                                                suffix={this._infoTooltip("International Air Transport Association (IATA) number. This is an identifier used by travel agents that allows the rental car company to pay the agent a commission for the rental.")}
                                                onChange={this._onChangeIataFilter}
                                                onBlur={this._onBlurFilter}
                                            />
                                        </Form.Item>

                                        <Form.Item label="Currency" size="small" colon className="mrgn-b-15">
                                            <Select defaultValue={currencyTo} size={size} onChange={this._onChangeCurrencyFilter}>
                                                <Select.Option value="EUR">Euro (EUR)</Select.Option>
                                                <Select.Option value="USD">Dollar (USD)</Select.Option>
                                                <Select.Option value="RUB">Ruble (RUB)</Select.Option>
                                            </Select>
                                        </Form.Item>

                                        <Divider orientation="left text-red-800" dashed>Personal data filters</Divider>

                                        <Row gutter={8}>
                                            <Col span={12}>
                                                <Form.Item label="Age" colon className="mrgn-b-15">
                                                    <InputNumber
                                                        allowClear
                                                        name={'ageFilter'}
                                                        size={size}
                                                        min={18}
                                                        max={99}
                                                        className="input"
                                                        value={ageFilter}
                                                        defaultValue={ageFilter}
                                                        suffix={this._infoTooltip("Driver’s age. This might influence the rates. Will be superseded by date of birth found in the profile provided in “membership_code”.")}
                                                        placeholder="Age"
                                                        onChange={this._onChangeAgeFilter}
                                                        onBlur={this._onBlurFilter}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label="Date of birth" colon className="mrgn-b-15">
                                                    <DatePicker
                                                        allowClear={false}
                                                        locale={locale}
                                                        format="YYYY-MM-DD"
                                                        size={size}
                                                        className="input"
                                                        value={dobFilterValue}
                                                        defaultValue={dobFilterValue}
                                                        suffix={this._infoTooltip("Driver’s date of birth. This might influence the rates. Will be superseded by “age” parameter or date of birth found in the profile provided in “membership_code”.")}
                                                        placeholder="Date of birth"
                                                        onChange={this._onChangeDobDateFilter}/>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item label="Membership Code" colon className="mrgn-b-15">
                                            <Input
                                                allowClear
                                                name={'membershipCodeFilter'}
                                                size={size}
                                                className="input"
                                                value={membershipCodeFilter}
                                                defaultValue={membershipCodeFilter}
                                                placeholder="Membership Code"
                                                suffix={this._infoTooltip("The brand membership program code. This can be an Avis wizard number, Budget customer number, or Payless number.")}
                                                onChange={this._onChangeMemberCodeFilter}
                                                onBlur={this._onBlurFilter}
                                            />
                                        </Form.Item>

                                        <Form.Item label="Discount Code" colon className="mrgn-b-15">
                                            <Input
                                                allowClear
                                                name={'discountCodeFilter'}
                                                size={size}
                                                className="input"
                                                value={discountCodeFilter}
                                                defaultValue={discountCodeFilter}
                                                placeholder="Discount Code"
                                                suffix={this._infoTooltip("The rental vehicle brand discount code. This field can be an Avis Worldwide Discount (AWD), Budget Car Discount (BCD), or a Payless Discount Number (PDN) code.")}
                                                onChange={this._onChangeDiscountCodeFilter}
                                                onBlur={this._onBlurFilter}
                                            />
                                        </Form.Item>

                                        <Form.Item label="Coupon Code" colon className="mrgn-b-15">
                                            <Input
                                                allowClear
                                                name={'couponCodeFilter'}
                                                size={size}
                                                className="input"
                                                value={couponCodeFilter}
                                                defaultValue={couponCodeFilter}
                                                placeholder="Coupon Code"
                                                suffix={this._infoTooltip("The promotional coupon code number to be applied to the reservation rate.")}
                                                onChange={this._onChangeCouponFilter}
                                                onBlur={this._onBlurFilter}
                                            />
                                        </Form.Item>

                                    </Form>
                                </Sider>
                                <Content className="content">
                                    {/*<Affix offsetTop={this.state.topOffset}>*/}
                                    <Row className="affixed-row">
                                        <Col xs={{span: 24}} md={{span: 24}} lg={{span: 21}} xl={{span: 21}}>
                                            <div className="fs24">Car Rental at {selectedLocation.cityName} (near John Kennedy Airport)</div>
                                            <div className="fs14 mrgn-tb-10">{vehicles['vehicles'].length} results found</div>
                                        </Col>
                                        <Col xs={{span: 24}} md={{span: 24}} lg={{span: 3}} xl={{span: 3}}>
                                            <Form.Item label="Sort by: " colon={true} labelCol={{span: 8, offset: 1}}>
                                                <Select defaultValue={orderFilter} size={size} onChange={this._onChangeOrderFilter}>
                                                    <Select.Option value="relevant">Relevant</Select.Option>
                                                    <Select.Option value="lowPrice">Low price</Select.Option>
                                                    <Select.Option value="highPrice">High price</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    {/*</Affix>*/}

                                    <Row type="flex" justify="space-around" align="middle" gutter={10}>
                                        {contentToRender}

                                        {/*<CarRentalItems image={image} brand={brand}/>*/}
                                    </Row>
                                </Content>
                            </Layout>
                        </Layout>
                    </Col>
                </Row>
            </>
        )
    }
}
