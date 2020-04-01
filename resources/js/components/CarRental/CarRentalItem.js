import React, {Component} from 'react'
import {Card, Divider, Icon, Tooltip, Row, Col} from 'antd'

import * as NOTIFICATIONS from '../../language-packs/en-GB'
import * as firestore from "../../services/firebase"

import moment from 'moment'

import {addOrRemoveFavoritesVehicle, showNotification} from '../../constants/utilities'

const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1307335_jzcbsutd7nn.js'
})
const authId = 'dGVzdDp0ZXN0'


export default class CarRentalItem extends Component {

    state = {
        addedToFavorites: false
    }

    _toggleMoreData = () => {
        this.props._toggleMoreData(this.props.id)
    }

    _addFavoriteVehicle = (inputArr, ref, data, transaction) => {
        const {product, reservation, qtyDays, currencyConvertedResult, currencySymbol, transactionId, pickupDate, dropoffDate} = this.props

        data.product = product
        data.reservation = reservation
        data.qtyDays = qtyDays
        data.currencyConvertedResult = currencyConvertedResult || 0
        data.currencySymbol = currencySymbol
        data.transactionId = transactionId
        data.pickupDate = moment(pickupDate).format('YYYY-MM-DD')
        data.dropoffDate = moment(dropoffDate).format('YYYY-MM-DD')
        inputArr.push(data)

        transaction.update(ref, {vehicles: inputArr})

        this.setState({addedToFavorites: true}, () => {
            showNotification('Favorites list', NOTIFICATIONS.FAV_CAR_ADDED, 'success')
        })
    }

    _addOrRemoveFavoritesVehicle = (data, transactionId, collectionId) => {
        const favoriteRef = firestore.connect.collection(collectionId).doc(authId)
        firestore.connect.runTransaction(transaction => {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(favoriteRef).then(doc => {
                if (!doc.data().vehicles) {

                    transaction.set(favoriteRef, {
                        vehicles: [data]
                    }, {merge: true})

                } else {

                    const tempArr = doc.data().vehicles

                    const category = data['category']
                    const makeTemp = category['make']
                    const modelTemp = category['model']

                    // TRANSACTION ID NOT EXISTS IN FAVORITES - ADD NEW RECORD
                    if (tempArr.filter(i => i['transactionId'] === transactionId).length === 0) {
                        this._addFavoriteVehicle(tempArr, favoriteRef, data, transaction)
                        // TRANSACTION ID EXISTS IN FAVORITES...
                    } else {
                        // MAKE & MODEL NOT EXISTS IN RECORD WITH THIS TRANSACTION ID - ADD NEW RECORD
                        if (tempArr.filter(i => i['category']['make'] === makeTemp).length === 0 ||
                            tempArr.filter(i => i['category']['model'] === modelTemp).length === 0) {

                            this._addFavoriteVehicle(tempArr, favoriteRef, data, transaction)

                            // MAKE & MODEL EXISTS IN RECORD WITH THIS TRANSACTION ID - REMOVE SELECTED RECORD
                        } else {
                            const newArray =
                                tempArr.filter(i => {
                                    return i['transactionId'] !== transactionId || i['category']['make'] !== makeTemp || i['category']['model'] !== modelTemp
                                })
                            transaction.update(favoriteRef, {vehicles: newArray})
                            this.setState({
                                addedToFavorites: false
                            }, () => {
                                showNotification('Favorites list', NOTIFICATIONS.FAV_CAR_REMOVED, 'info')
                                return Promise.resolve(true)
                            })
                        }
                    }
                }
            })
        }).catch(error => {
            console.error("_addOrRemoveFavoritesVehicle failed: ", error)
        })
    }

    _checkFavoritesVehicle = (data, transactionId, collectionId) => {
        const favoriteRef = firestore.connect.collection(collectionId).doc(authId)
        firestore.connect.runTransaction(transaction => {

            // This code may get re-run multiple times if there are conflicts.
            return favoriteRef.get().then(doc => {

                if (!doc.data().vehicles) {
                    data.transactionId = transactionId
                    transaction.set(favoriteRef, {
                        vehicles: [data]
                    }, {merge: true})
                } else {
                    const tempArr = doc.data().vehicles

                    const category = data['category']
                    const makeTemp = category['make']
                    const modelTemp = category['model']

                    // TRANSACTION ID EXISTS IN FAVORITES - GO FORWARD
                    if (tempArr.filter(i => i['transactionId'] === transactionId).length !== 0) {

                        // MAKE & MODEL EXISTS IN RECORD WITH THIS TRANSACTION ID - FAVORITES IS TRUE
                        if (
                            tempArr.filter(i => i['category']['make'] === makeTemp).length !== 0 &&
                            tempArr.filter(i => i['category']['model'] === modelTemp).length !== 0
                        ) {
                            this.setState({
                                addedToFavorites: true
                            }, () => Promise.resolve(true))
                        }
                    }
                }
            })
        }).catch(error => {
            console.error("_checkFavoritesVehicle failed: ", error)
        })
    }

    _getBrandImage = name => {
        // TO-DO: to fix
        if (!name) name = 'avis'
        return `../../images/rental-brands/${name.toLowerCase()}_logo.jpg`
    }

    _addDefaultVehicleImage = event => {
        event.target.src = '../../images/car-rental.png'
    }

    componentDidMount() {
        const {vehicle, transactionId} = this.props
        this._checkFavoritesVehicle(vehicle, transactionId, 'favoriteCarRentals')
    }


    render() {
        const {addedToFavorites} = this.state
        const {vehicle, product, reservation, qtyDays, currencyConvertedResult, currencySymbol, addedToFavoritesDisabled, transactionId, isMoreInfoOpen} = this.props

        const pickUpLocation = reservation ? reservation.pickup_location.location : 'N/A'
        const dropOffLocation = reservation ? reservation.dropoff_location.location : 'N/A'
        const vehicleCategory = vehicle.category
        //const vehicleRate = vehicle.rate_totals.rate
        const vehicleFeatures = vehicle.features
        const vehiclePayLater = vehicle.rate_totals.pay_later

        const qtyDaysInt = Math.ceil(qtyDays)

        const total = currencyConvertedResult ?
            (parseFloat(vehiclePayLater['reservation_total']) * currencyConvertedResult).toFixed(2) :
            vehiclePayLater['reservation_total']


        const vehicleMake = (vehicleCategory['make']).replace(/^\w/, c => c.toUpperCase())
        const vehicleModel = vehicleCategory['model']
        const vehicleName = `${vehicleMake} ${vehicleModel}`

        const vehicleCatName = vehicleCategory['name']
        const isCatWithIsSimilar = vehicleCatName.includes('or similar')

        /** TO-DO : ADD REAL IMAGE **/
        //let img = vehicleCategory['image_url']
        let img = '../../images/car-rental.png'

        return (
            <Card className={`card-car-rental ${isMoreInfoOpen ? 'opened' : ''}`}>
                <div className="images-price">
                    <img className="car-img" onError={this._addDefaultVehicleImage} src={img} alt=""/>
                    <div className="inline">
                        <div className="price">
                            <span className="fs18 bold">{`${currencySymbol} ${total}`}</span>&nbsp; for &nbsp;
                            <span className="fs16 days-text">{qtyDaysInt === 1 ? `${qtyDaysInt} day` : `${qtyDaysInt} days`}</span>
                            <div className="fs12 include-text">includes taxes e fees</div>
                        </div>
                        <div className="brand-img">
                            <img src={this._getBrandImage(product['brand'])} alt={product['brand']}/>
                        </div>
                    </div>
                </div>
                <div className="information">
                    <div className="inline title-fav-row">
                        <Tooltip placement="topLeft" title={vehicleCategory['name']}>
                            <div className="name three-dots">
                                <span className="fs20">{vehicleName}</span>
                                {isCatWithIsSimilar && <span className="fs14">&nbsp;&nbsp;or similar</span>}
                            </div>
                        </Tooltip>
                        {
                            !addedToFavoritesDisabled &&
                            <Tooltip placement="top" title={`${addedToFavorites ? 'Saved' : 'Save'} for later`}>
                                <div className={`${addedToFavorites && 'favorite-circle'}`}>
                                    <IconFont className={`icon favorite ${addedToFavorites && 'active'}`} type="icon-favorite"
                                              onClick={() => this._addOrRemoveFavoritesVehicle(vehicle, transactionId, 'favoriteCarRentals')}/>
                                </div>
                            </Tooltip>
                        }
                    </div>
                    <Divider dashed/>
                    <div className="inline features">
                        <div className="transmission inline">
                            <IconFont className="icon" type="icon-gear"/>
                            {vehicleCategory['vehicle_transmission']}
                        </div>
                        <div className="fuel inline">
                            <IconFont className="icon" type="icon-fuel"/>
                            {vehicleCategory['mpg'] ? `${vehicleCategory['mpg']} mpg` : 'N/A'}
                        </div>
                        <div className="car-classname inline">
                            <IconFont className="icon" type="icon-vehicle-class"/>
                            {vehicleCategory['vehicle_class_name']}
                        </div>
                    </div>
                    <div className="inline features">
                        <div className="air-condition inline">
                            <IconFont className="icon" type="icon-air-condition"/>
                            {vehicleFeatures['air_conditioned'] ? 'Aircondition' : 'N/A'}
                        </div>
                        <div className="bluetooth inline">
                            <IconFont className="icon" type="icon-bluetooth"/>
                            {vehicleFeatures['bluetooth_equipped'] ? 'Bluetooth' : 'N/A'}
                        </div>
                        <div className="smoke-free inline">
                            <IconFont className="icon" type="icon-smoke-free"/>
                            {vehicleFeatures['smoke_free'] ? 'Smoke free' : 'N/A'}
                        </div>
                    </div>
                    <div className="inline features">
                        <div className="doors inline">
                            <IconFont className="icon" type="icon-door"/>
                            {vehicle.capacity['doors']} doors
                        </div>
                        <div className="seats inline">
                            <IconFont className="icon" type="icon-seat"/>
                            {vehicle.capacity['seats']} seats
                        </div>
                        <div className="suitcase inline">
                            <IconFont className="icon" type="icon-suitcase"/>
                            {vehicle.capacity['luggage_capacity']['large_suitcase']} large suitcase
                        </div>
                    </div>
                    {
                        (isMoreInfoOpen || addedToFavoritesDisabled) &&
                        <>
                            <Divider dashed/>
                            <Row type="flex" justify="space-around" align="middle" gutter={5} className="mrgn-b-20">
                                <Col xs={{span: 24}} md={{span: 24}} lg={{span: 24}} xl={{span: 12}} style={{position: 'relative'}}>
                                    {/*<div className="fs-16" style={{display: 'flex', marginTop: 10}}>*/}
                                    <div style={{width: 65}} className="mrgn-b-10">Pickup:</div>
                                    <div>
                                        <div className="vert-align-ctr">
                                            <Icon type="environment" className="fs16 mrgn-r-5"/>
                                            <span className="fs12">{pickUpLocation['name']}</span><br/>
                                        </div>
                                        <div className="vert-align-ctr mrgn-t-10">
                                            <Icon type="phone" className="fs16 mrgn-r-5"/>
                                            <span className="fs12">{pickUpLocation['telephone']}</span><br/>
                                        </div>
                                        <div className="vert-align-ctr mrgn-t-10">
                                            <Icon type="unlock" className="fs16 mrgn-r-5"/>
                                            <span className="fs12">{pickUpLocation['hours']}</span>
                                        </div>
                                    </div>
                                    {/*</div>*/}
                                </Col>
                                <Col xs={{span: 24}} md={{span: 24}} lg={{span: 24}} xl={{span: 12}} style={{position: 'relative'}}>
                                    {/*<div className="fs-16 mrgn-t-20" style={{display: 'flex'}}>*/}
                                    <div style={{width: 65}} className="mrgn-b-10">Dropoff:</div>
                                    <div>
                                        <div className="vert-align-ctr">
                                            <Icon type="environment" className="fs16 mrgn-r-5"/>
                                            <span className="fs12">{dropOffLocation['name']}</span><br/>
                                        </div>
                                        <div className="vert-align-ctr mrgn-t-10">
                                            <Icon type="phone" className="fs16 mrgn-r-5"/>
                                            <span className="fs12">{dropOffLocation['telephone']}</span><br/>
                                        </div>
                                        <div className="vert-align-ctr mrgn-t-10">
                                            <Icon type="unlock" className="fs16 mrgn-r-5"/>
                                            <span className="fs12">{dropOffLocation['hours']}</span>
                                        </div>
                                    </div>
                                    {/*</div>*/}
                                </Col>
                            </Row>
                        </>
                    }
                    {
                        !addedToFavoritesDisabled &&
                        <div className="more-data">
                            <IconFont className={`icon more-data-icon ${isMoreInfoOpen ? "up" : ""}`}
                                      type="icon-arrow-down" onClick={() => this._toggleMoreData()}/>
                        </div>
                    }
                </div>
            </Card>
        )
    }
}