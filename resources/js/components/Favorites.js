import React, {Component} from 'react'
import {Col, Divider, Row, Card, List, Empty, Tooltip, Spin, Modal, Icon, Popconfirm, Tag} from 'antd'
import moment from 'moment'

moment.locale('en-EN')

import Header from './Header'
import CarRentalItem from './CarRental/CarRentalItem'
import HotelItem from './Hotel/HotelItem'

import {getFirebaseDate, showNotification, momentTzFormat, dateFormat} from '../constants/utilities'
import * as firestore from '../services/firebase'
import * as NOTIFICATIONS from '../language-packs/en-GB'

const authId = 'dGVzdDp0ZXN0'


class CarRentalItemWrapper extends Component {

    state = {
        isVisibleCarRentalModal: false
    }

    _addDefaultHotelImage = event => {
        event.target.src = '../../images/car-rental.png'
    }

    _onOpenCarRentalDetailed = () => {
        this.setState({
            isVisibleCarRentalModal: true,
        })
    }

    _onCloseCarRentalDetailed = () => {
        this.setState({
            isVisibleCarRentalModal: false,
        })
    }

    _removeFavoriteVehicle = data => {
        const favoriteVehiclesRef = firestore.connect.collection('favoriteCarRentals').doc(authId)
        firestore.connect.runTransaction(transaction => {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(favoriteVehiclesRef).then(doc => {

                const tempArr = doc.data().vehicles

                const category = data['category']
                const makeTemp = category['make']
                const modelTemp = category['model']
                const transactionId = data['transactionId']

                // TRANSACTION ID EXISTS IN FAVORITES...
                if (tempArr.filter(i => i['transactionId'] === transactionId).length > 0 &&
                    tempArr.filter(i => i['category']['make'] === makeTemp).length > 0 &&
                    tempArr.filter(i => i['category']['model'] === modelTemp).length > 0) {

                    const newArray =
                        tempArr.filter(i => {
                            return i['transactionId'] !== transactionId || i['category']['make'] !== makeTemp || i['category']['model'] !== modelTemp
                        })

                    transaction.update(favoriteVehiclesRef, {vehicles: newArray})
                    return Promise.resolve(true)
                }
            })
        }).then(() => {
            showNotification('Favorites list', NOTIFICATIONS.FAV_CAR_REMOVED, 'info')
            this.props._getFavoriteVehicles()
        }).catch(error => {
            console.error("_addOrRemoveFavoritesVehicle failed: ", error)
        })
    }

    render() {

        const {vehicle} = this.props
        const {isVisibleCarRentalModal} = this.state


        const vehicleCategory = vehicle['category']

        const vehicleMake = (vehicleCategory['make']).replace(/^\w/, c => c.toUpperCase())
        const vehicleModel = vehicleCategory['model']
        const vehicleName = `${vehicleMake} ${vehicleModel}`

        const pickupDate = momentTzFormat(vehicle.pickupDate, null, dateFormat('favoriteRentalBookPeriod'))
        const dropoffDate = momentTzFormat(vehicle.dropoffDate, null, dateFormat('favoriteRentalBookPeriod'))

        //vehicle.pickupDate = '2020-02-11'
        const pickupD = momentTzFormat(vehicle.pickupDate, null, 'YYYY-MM-DD')
        const isFavoriteExpired = moment(moment()).isAfter(pickupD)


        /** TO-DO : ADD REAL IMAGE **/
            //let img = vehicleCategory['image_url']
        let img = '../../images/car-rental.png'

        return (
            <>
                <Card className={`favorite-car-rental ${isFavoriteExpired ? "expired" : ''}`}>
                    <Row type="flex" justify="space-between">
                        <Col className="fs18 bold name">{vehicleName}</Col>
                        <Col>
                            <Tooltip placement="bottom" title="More details">
                                <Icon type="info-circle" className="fs16 mrgn-r-10 more-details" onClick={this._onOpenCarRentalDetailed}/>
                            </Tooltip>

                            <Tooltip placement="bottom" title="Remove from Favorites">
                                <Popconfirm
                                    title="Do you really want to delete this availability from your Favorites?"
                                    icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                                    onConfirm={() => this._removeFavoriteVehicle(vehicle)}
                                >
                                    <Icon type="delete" className="fs16 remove-favorite"/>
                                </Popconfirm>
                            </Tooltip>
                        </Col>
                    </Row>

                    <img className="img mrgn-tb-5" onError={this._addDefaultHotelImage} src={img} alt=""/>

                    <Row type="flex" justify="space-between" className="mrgn-t-10">
                        <Col className="fs14 text-left period three-dots pointer">
                            <Tooltip placement="top" title={`${pickupDate} - ${dropoffDate}`}>
                                <span className="bold">Rental period:</span> {`${pickupDate} - ${dropoffDate}`}
                            </Tooltip>
                        </Col>
                        {
                            isFavoriteExpired &&
                            <Tooltip placement="top" title="You cannot get this reservation as it's expired, please remove it!">
                                <Tag color="red" className="mrgn-reset">Availability expired</Tag>
                            </Tooltip>
                        }
                    </Row>
                </Card>
                <Modal
                    title={vehicleName}
                    visible={isVisibleCarRentalModal}
                    footer={null}
                    width="50%"
                    onCancel={this._onCloseCarRentalDetailed}
                    closable={false}
                >
                    <Row type="flex" justify="space-around" align="middle" gutter={10}>
                        <Col xs={{span: 24}} md={{span: 24}} lg={{span: 24}} xl={{span: 24}} style={{position: 'relative'}}>
                            <CarRentalItem
                                vehicle={vehicle}
                                reservation={vehicle.reservation}
                                product={vehicle.product}
                                qtyDays={vehicle.qtyDays}
                                currencyConvertedResult={vehicle.currencyConvertedResult}
                                currencySymbol={vehicle.currencySymbol}
                                addedToFavoritesDisabled
                            />
                        </Col>
                    </Row>
                </Modal>
            </>
        )
    }
}


class HotelItemWrapper extends Component {

    state = {
        isVisibleHotelModal: false
    }

    _addDefaultHotelImage = event => {
        event.target.src = '../../images/hotel.jpg'
    }

    _onOpenHotelDetailed = () => {
        this.setState({
            isVisibleHotelModal: true,
        })
    }

    _onCloseHotelDetailed = () => {
        this.setState({
            isVisibleHotelModal: false,
        })
    }

    _removeFavoriteHotel = data => {
        const favoriteHotelsRef = firestore.connect.collection('favoriteHotels').doc(authId)
        firestore.connect.runTransaction(transaction => {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(favoriteHotelsRef).then(doc => {

                const tempArr = doc.data().hotels

                const id = data['id']

                // TRANSACTION ID EXISTS IN FAVORITES...
                if (tempArr.filter(i => i['id'] === id).length > 0) {
                    const newArray = tempArr.filter(i => i['id'] !== id)
                    transaction.update(favoriteHotelsRef, {hotels: newArray})
                    return Promise.resolve(true)
                }
            })
        }).then(() => {
            showNotification('Favorites list', NOTIFICATIONS.FAV_HOTEL_REMOVED, 'info')
            this.props._getFavoriteHotels()
        }).catch(error => {
            console.error("_removeFavoriteHotel failed: ", error)
        })
    }

    render() {

        const {hotel} = this.props
        const {isVisibleHotelModal} = this.state

        const name = hotel.name
        const ratePlan = hotel.ratePlan
        const price = ratePlan.price.current
        const oldPrice = ratePlan.price.old
        const img = hotel.thumbnailUrl

        const checkinDate = momentTzFormat(hotel.checkinDate, null, dateFormat('favoriteRentalBookPeriod'))
        const checkoutDate = momentTzFormat(hotel.checkoutDate, null, dateFormat('favoriteRentalBookPeriod'))

        const checkinD = momentTzFormat(hotel.checkinDate, null, 'YYYY-MM-DD')
        const isFavoriteExpired = moment(moment()).isAfter(checkinD)

        /** TO-DO: CHANGE CLASSES **/

        return (
            <>
                <Card className={`favorite-hotel ${isFavoriteExpired ? "expired" : ''}`}>
                    <Row type="flex" justify="space-between">
                        <Col span={15} className="fs18 bold name text-left">{name}</Col>
                        <Col span={5} className="text-right prices">
                            <span className="fs16 striked muted-text mrgn-r-5 bold">{oldPrice}</span>
                            <span className="fs18">{price}</span>
                        </Col>
                        <Col span={4} className="text-right">
                            <Tooltip placement="bottom" title="More details">
                                <Icon type="info-circle" className="fs16 mrgn-r-10 more-details" onClick={this._onOpenHotelDetailed}/>
                            </Tooltip>

                            <Tooltip placement="bottom" title="Remove from Favorites">
                                <Popconfirm
                                    title="Do you really want to delete this hotel from your Favorites?"
                                    icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                                    onConfirm={() => this._removeFavoriteHotel(hotel)}
                                >
                                    <Icon type="delete" className="fs16 remove-favorite"/>
                                </Popconfirm>
                            </Tooltip>
                        </Col>
                    </Row>

                    <img className="img mrgn-tb-5" onError={this._addDefaultHotelImage} src={img} alt=""/>

                    <Row type="flex" justify="space-between" className="mrgn-t-10">>
                        <Col className="fs14 text-left period three-dots pointer">
                            <Tooltip placement="top" title={`${checkinDate} - ${checkoutDate}`}>
                                <span className="bold">Book period:</span> {`${checkinDate} - ${checkoutDate}`}
                            </Tooltip>
                        </Col>
                        {
                            isFavoriteExpired &&
                            <Tooltip placement="top" title="You cannot get this hotel as it's expired, please remove it!">
                                <Tag color="red" className="mrgn-reset">Availability expired</Tag>
                            </Tooltip>
                        }
                    </Row>
                </Card>
                <Modal
                    title={name}
                    visible={isVisibleHotelModal}
                    footer={null}
                    width="50%"
                    onCancel={this._onCloseHotelDetailed}
                    closable={false}
                >
                    <Row type="flex" justify="space-around" align="middle" gutter={10}>
                        <Col xs={{span: 24}} md={{span: 24}} lg={{span: 24}} xl={{span: 24}} style={{position: 'relative'}}>
                            <HotelItem hotelId={hotel.id}
                                       hotelData={hotel}
                                       qtyDays={hotel.qtyDays}
                                       currencyConvertedResult={hotel.currencyConvertedResult}
                                       currencySymbol={hotel.currencySymbol}
                                       checkinDate={checkinDate}
                                       checkoutDate={checkoutDate}/>
                        </Col>
                    </Row>
                </Modal>
            </>
        )
    }
}


const FavoriteCity = props => (
    <Card className="favorite-city">
        <Tooltip placement="top" title={props.name}>
            <div className="fs20 truncate">
                {props.name}
            </div>
        </Tooltip>
        <Tooltip placement="bottom" title={props.date}>
            <div className="fs16 text-blue italic truncate">
                {props.date}
            </div>
        </Tooltip>
    </Card>
)

class FavoritesContent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            favoriteCities: [],
            favoriteCitiesLoading: true,
            favoriteVehicles: [],
            favoriteVehiclesLoading: true,
            favoriteHotels: [],
            favoriteHotelsLoading: true,
        }
    }

    _getFavoriteCities = () => {
        const favoriteCitiesRef = firestore.connect.collection('favoriteCities').doc(authId)
        favoriteCitiesRef.get().then(doc => {
            if (doc.exists) {
                this.setState({
                    favoriteCities: doc.data().cities || [],
                    favoriteCitiesLoading: false
                })
            } else {
                this.setState({favoriteCitiesLoading: false})
                console.warn('No results for favorite cities')
            }
        })
    }

    _getFavoriteVehicles = () => {
        const favoriteVehiclesRef = firestore.connect.collection('favoriteCarRentals').doc(authId)
        favoriteVehiclesRef.get().then(doc => {
            if (doc.exists) {
                this.setState({
                    favoriteVehicles: doc.data().vehicles || [],
                    favoriteVehiclesLoading: false
                })
            } else {
                this.setState({favoriteVehiclesLoading: false})
                console.warn('No results for favorite vehicles')
            }
        })
    }

    _getFavoriteHotels = () => {
        const favoriteHotelsRef = firestore.connect.collection('favoriteHotels').doc(authId)
        favoriteHotelsRef.get().then(doc => {
            if (doc.exists) {
                this.setState({
                    favoriteHotels: doc.data().hotels || [],
                    favoriteHotelsLoading: false
                })
            } else {
                this.setState({favoriteHotelsLoading: false})
                console.warn('No results for favorite hotels')
            }
        })
    }


    _renderFavoriteCities = () => {
        const {favoriteCities, favoriteCitiesLoading} = this.state
        let contentToRender = null

        if (favoriteCitiesLoading)
            contentToRender = <Spin/>
        else {
            if (favoriteCities.length === 0)
                contentToRender = <Empty/>
            else
                contentToRender = (
                    <List
                        grid={{gutter: 5, xs: 2, sm: 2, md: 2, lg: 6, xl: 8, xxl: 6}}
                        dataSource={favoriteCities}
                        renderItem={(city, id) => (
                            <List.Item>
                                <FavoriteCity key={id} name={city.cityName}
                                              date={getFirebaseDate(city.dateArrival.seconds, dateFormat('favoriteCities'))}/>
                            </List.Item>
                        )}
                    />
                )
        }
        return contentToRender
    }

    _renderFavoriteVehicles = () => {
        const {favoriteVehicles, favoriteVehiclesLoading} = this.state
        let contentToRender = null

        if (favoriteVehiclesLoading)
            contentToRender = <Spin/>
        else {
            if (favoriteVehicles.length === 0)
                contentToRender = <Empty/>
            else
                contentToRender = (
                    <List
                        grid={{gutter: 5, xs: 1, sm: 1, md: 1, lg: 2, xl: 3, xxl: 3}}
                        dataSource={favoriteVehicles}
                        renderItem={(vehicle, id) => (
                            <List.Item>
                                <CarRentalItemWrapper key={id} vehicle={vehicle} _getFavoriteVehicles={this._getFavoriteVehicles}/>
                            </List.Item>
                        )}
                    />
                )
        }
        return contentToRender
    }

    _renderFavoriteHotels = () => {
        const {favoriteHotels, favoriteHotelsLoading} = this.state
        let contentToRender = null

        if (favoriteHotelsLoading)
            contentToRender = <Spin/>
        else {
            if (favoriteHotels.length === 0)
                contentToRender = <Empty/>
            else
                contentToRender = (
                    <List
                        grid={{gutter: 5, xs: 1, sm: 1, md: 1, lg: 2, xl: 3, xxl: 3}}
                        dataSource={favoriteHotels}
                        renderItem={(hotel, id) => (
                            <List.Item>
                                <HotelItemWrapper key={id} hotel={hotel} _getFavoriteHotels={this._getFavoriteHotels}/>
                            </List.Item>
                        )}
                    />
                )
        }
        return contentToRender
    }

    componentDidMount() {
        this._getFavoriteCities()
        this._getFavoriteVehicles()
        this._getFavoriteHotels()
    }

    render() {

        return (
            <Row type="flex" justify="space-around" align="middle" className="container-row favorites">
                <Col className="container-cell" span={24}>
                    <Row type="flex" justify="space-between" align="middle">
                        <Col span={18} offset={3}>
                            <div className="fs24 mrgn-tb-20">Your favorite cities</div>
                            {this._renderFavoriteCities()}
                            <Divider dashed/>
                        </Col>
                    </Row>
                    <Row type="flex" justify="space-between" align="middle">
                        <Col span={18} offset={3}>
                            <div className="fs24 mrgn-b-20">Your favorite Car Rentals</div>
                            {this._renderFavoriteVehicles()}
                            <Divider dashed/>
                        </Col>
                    </Row>
                    <Row type="flex" justify="space-between" align="middle">
                        <Col span={18} offset={3}>
                            <div className="fs24 mrgn-b-20">Your favorite Hotels</div>
                            {this._renderFavoriteHotels()}
                        </Col>
                    </Row>
                    <Divider dashed/>
                </Col>
            </Row>
        )
    }
}


class Favorites extends Component {

    render() {
        return (
            <>
                <Header breadcrumbFavorites/>
                <Row type="flex" className="content-wrapper">
                    <Col span={24} style={{height: '100%'}}>
                        <FavoritesContent/>
                    </Col>
                </Row>
            </>
        )
    }
}

export default Favorites