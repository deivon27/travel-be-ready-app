import React, {Component} from 'react'
import {
    Card,
    Divider,
    Icon,
    Tooltip,
    Drawer,
    Button,
    Rate
} from 'antd'
import moment from "moment/moment";

import * as firestore from "../../services/firebase"
import * as URLS from "../../constants/urls"
import * as NOTIFICATIONS from "../../language-packs/en-GB"

import ContentDrawer from "./ContentDrawer"
import {showNotification, getLocalVal} from '../../constants/utilities'

const IconFont = Icon.createFromIconfontCN({scriptUrl: '//at.alicdn.com/t/font_1307335_jzcbsutd7nn.js'})
const authId = 'dGVzdDp0ZXN0'


export default class HotelItem extends Component {

    state = {
        isVisibleHotelDrawer: false,
        addedToFavorites: false,
        hotelDetails: getLocalVal('hotelDetails', []),
        googleAddressLinks: getLocalVal('googleAddressLinks', false)
    }

    _showDrawer = () => {
        this.setState({
            isVisibleHotelDrawer: true
        })
    }

    _onClose = () => {
        this.setState({
            isVisibleHotelDrawer: false
        })
    }

    _addFavoriteVehicle = (inputArr, ref, data, transaction) => {
        const {qtyDays, currencyConvertedResult, currencySymbol, checkinDate, checkoutDate} = this.props
        data.qtyDays = qtyDays
        data.currencyConvertedResult = currencyConvertedResult || 0
        data.currencySymbol = currencySymbol
        data.checkinDate = moment(checkinDate).format('YYYY-MM-DD')
        data.checkoutDate = moment(checkoutDate).format('YYYY-MM-DD')
        inputArr.push(data)
        transaction.update(ref, {hotels: inputArr})

        this.setState({addedToFavorites: true}, () => {
            showNotification('Favorites list', NOTIFICATIONS.FAV_HOTEL_ADDED, 'success')
        })
    }

    _addOrRemoveFavoritesHotel = (data, hotelId, collectionId) => {
        const favoriteRef = firestore.connect.collection(collectionId).doc(authId)
        firestore.connect.runTransaction(transaction => {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(favoriteRef).then(doc => {
                if (!doc.data().hotels) {
                    transaction.set(favoriteRef, {
                        hotels: [data]
                    }, {merge: true})

                    this.setState({addedToFavorites: true}, () => {
                        return showNotification('Favorites list', NOTIFICATIONS.FAV_HOTEL_ADDED, 'success')
                    })
                } else {
                    const tempArr = doc.data().hotels

                    // TRANSACTION ID NOT EXISTS IN FAVORITES - ADD NEW RECORD
                    if (tempArr.filter(i => i['id'] === hotelId).length === 0) {
                        this._addFavoriteVehicle(tempArr, favoriteRef, data, transaction)
                        // HOTEL ID EXISTS IN FAVORITES - REMOVE SELECTED RECORD
                    } else {
                        const newArray = tempArr.filter(i => {
                            return i['id'] !== hotelId
                        })
                        transaction.update(favoriteRef, {hotels: newArray})
                        this.setState({
                            addedToFavorites: false
                        }, () => {
                            showNotification('Favorites list', NOTIFICATIONS.FAV_HOTEL_REMOVED, 'info')
                            return Promise.resolve(true)
                        })
                    }
                }
            })
        }).catch(error => {
            console.error("_addOrRemoveFavoritesHotels failed: ", error)
        })
    }

    _checkFavoritesHotel = (data, hotelId, collectionId) => {
        const favoriteRef = firestore.connect.collection(collectionId).doc(authId)
        firestore.connect.runTransaction(transaction => {
            // This code may get re-run multiple times if there are conflicts.
            return favoriteRef.get().then(doc => {
                const hotels = doc.data().hotels
                if (hotels) {
                    // HOTEL ID EXISTS IN FAVORITES - ADD NEW RECORD
                    if (hotels.filter(i => i['id'] === hotelId).length !== 0) {
                        // HOTEL ID EXISTS IN FAVORITES - FAVORITES IS TRUE
                        this.setState({
                            addedToFavorites: true
                        }, () => Promise.resolve(true))
                    }
                }
            })
        }).catch(error => {
            console.error("_checkFavoritesHotels failed: ", error)
        })
    }

    componentDidMount() {
        const {hotelData, hotelId} = this.props
        this._checkFavoritesHotel(hotelData, hotelId, 'favoriteHotels')
    }

    render() {
        const {hotelData, hotelId} = this.props
        const {addedToFavorites, hotelDetails, googleAddressLinks} = this.state

        /** Hotel details **/
        const image = hotelData.thumbnailUrl ? hotelData.thumbnailUrl : "images/hotel.jpg"
        const name = hotelData.name
        const stars = hotelData.starRating
        const ratingBlock =
            stars ? Array.from({length: stars}, (item, key) => {
                return <Icon key={key} type="star" theme="twoTone" twoToneColor="#6c757d" className="mrgn-r-5 fs24"/>
            }) : <span className="muted-text">No star rating available</span>

        const roomsLeft = hotelData.roomsLeft


        /** Reviews **/
        const tripAdvisorReviews = hotelData.tripAdvisorGuestReviews
        const tripAdvisorReviewsBlock = tripAdvisorReviews &&
            <div className="vert-align-ctr">
                <span className="fs20 mrgn-l-5 text-grey">{tripAdvisorReviews.rating}/5</span>
                <span className="fs13 mrgn-l-5 text-grey">{`(${tripAdvisorReviews.total} reviewers)`}</span>
            </div>

        const guestReviews = hotelData.guestReviews
        //const guestReviewsBlock = guestReviews && `${guestReviews.unformattedRating}/${guestReviews.scale} | ${guestReviews.total} reviewers`
        const guestReviewsBlock =
            guestReviews &&
            <div className="inline">
                <Rate
                    tooltips={[...Array(10).keys()].map(i => i + 1)}
                    size="small"
                    className="fs16 mrgn-r-5 mrgn-l-5"
                    value={guestReviews.unformattedRating}
                    count={10}
                    disabled
                    allowHalf
                />&nbsp;
                <div className="fs13 flex-1 mrgn-l-5 text-grey">({guestReviews.total} reviewers)</div>
            </div>

        /** Rates, prices **/
        const ratePlan = hotelData.ratePlan
        const price = ratePlan.price.current
        const oldPrice = ratePlan.price.old
        const infoPrice = ratePlan.price.info
        const additionalInfoPrice = ratePlan.price.additionalInfo
        const totalPricePerStay = ratePlan.price.totalPricePerStay

        //const infoPrice = "nightly price per unit"
        //const additionalInfoPrice = "This is the average nightly price for your dates."
        // const totalPricePerStay = "(<strong>$289</strong> for 7 nights)"


        /** Features **/
        const features = ratePlan.features
        const noCCRequired = features.noCCRequired
        const paymentPreference = features.paymentPreference
        const freeCancellation = features.freeCancellation
        const featuresBlock = (
            <>
                <div className="mrgn-tb-5 vert-align-ctr">
                    <Icon type="exception" className="fs16"/>&nbsp;
                    <div>{`${freeCancellation ? 'No f' : 'F'}ree cancellation`}</div>
                </div>
                <div className="mrgn-tb-5 vert-align-ctr">
                    <Icon type="credit-card" className="fs16"/>&nbsp;
                    <div>{`${noCCRequired ? 'No c' : 'C'}redit card required`}</div>
                </div>
                <div className="mrgn-tb-5 vert-align-ctr">
                    <Icon type="issues-close" className="fs16"/>&nbsp;
                    <div>{`${!paymentPreference ? 'No' : 'There are some'} payment preference`}</div>
                </div>
            </>
        )


        /** Coupons and deals **/
        const coupon = hotelData.coupon

        const deals = hotelData.deals
        const greatRate = (deals && deals.greatRate) && 'Great Price'
        const specialDeal = (deals && deals.specialDeal) && deals.specialDeal.dealText
        const secretPrice = (deals && deals.secretPrice) && deals.secretPrice.dealText

        let dealsBlock = null
        if (greatRate) dealsBlock = greatRate
        else if (specialDeal) dealsBlock = specialDeal
        else if (secretPrice) dealsBlock = secretPrice


        /** Address and neighbourhood **/
        const neighbourhood = hotelData.neighbourhood

        const address = hotelData.address
        const addressLine1 = address.streetAddress && `${address.streetAddress},`
        const addressLine2 = address.extendedAddress && `${address.extendedAddress},`
        const locality = address.locality
        const region = address.region && `${address.region},`
        const postalCode = address.postalCode
        const countryCode = address.countryCode
        const addressFull = `${addressLine1} ${addressLine2} ${locality}, ${region} ${postalCode} (${(countryCode).toUpperCase()})`


        const landmarks = hotelData.landmarks
        const landmarksBlock = landmarks.map((item, key) => {
            const arrivalPoint = `${region ? region : locality} ${item.label}`
            return (
                <div key={key}>
                    {`${item.label} at ${item.distance}`}

                    {/** GOOGLE LINKS **/}
                    {
                        googleAddressLinks &&
                        <a className="fs12 mrgn-l-15"
                           href={`${URLS.URL_GOOGLE_MAPS}saddr=${encodeURI(addressFull)}&daddr=${encodeURI(arrivalPoint)}`}
                           target="_blank">How to get?
                        </a>
                    }
                </div>
            )
        })


        //// TEMPORARY
        const addedToFavoritesDisabled = false

        return (
            <Card className="card-hotel" key={hotelId}>
                <div className="images-price">
                    <div className="inline rating-block">
                        <Tooltip placement="top" title={`${stars ? `${stars + ' stars hotel'}` : 'No star rating available'}`}>{ratingBlock}</Tooltip>
                    </div>
                    <img className="car-img mrgn-t-10" src={image} alt={name}/>
                    <div className="inline">
                        <div className="fs12">{featuresBlock}</div>

                        <div className="price text-right">
                            <span className="fs22 striked muted-text mrgn-r-5 bold">{oldPrice}</span>
                            <Tooltip placement="top" title={additionalInfoPrice}>
                                <span className={`fs24 ${additionalInfoPrice && 'help-cursor'}`}>{price}</span>
                            </Tooltip>
                            {infoPrice && <div className="fs12 days-text">{infoPrice}</div>}
                            <div className="fs12 include-text" dangerouslySetInnerHTML={{__html: totalPricePerStay}}/>
                        </div>
                    </div>
                </div>
                <div className="information">
                    <div className="inline title-fav-row">
                        <Tooltip placement="topLeft" title={name}>
                            <div className="fs20 name">{name}</div>
                        </Tooltip>
                        {
                            !addedToFavoritesDisabled &&
                            <Tooltip placement="top" title={`${addedToFavorites ? 'Saved' : 'Save'} for later`}>
                                <div className={`${addedToFavorites && 'favorite-circle'}`}>
                                    <IconFont className={`icon favorite ${addedToFavorites && 'active'}`} type="icon-favorite"
                                              onClick={() => this._addOrRemoveFavoritesHotel(hotelData, hotelId, 'favoriteHotels')}/>
                                </div>
                            </Tooltip>
                        }
                    </div>
                    {
                        roomsLeft &&
                        <div className="mrgn-tb-10 vert-align-ctr">
                            <Icon type="container" className="fs18 mrgn-r-5"/>
                            <span className="italic bold mrgn-r-10">Rooms left:</span>{roomsLeft}
                        </div>
                    }
                    <div className={`${!roomsLeft && 'mrgn-tb-10'} vert-align-ctr`}>
                        <Icon type="environment" className="fs18 mrgn-r-5"/>
                        <div>
                            <span className="italic bold mrgn-r-10">Address:</span>{addressFull}
                            {/** GOOGLE LINKS **/}
                            {
                                googleAddressLinks &&
                                <span className="fs12 mrgn-l-20">
                                    <a href={`${URLS.URL_GOOGLE_MAPS}q=${encodeURI(addressFull)}`} title={addressFull} target="_blank">
                                        view on Google Maps
                                    </a>
                                </span>
                            }
                        </div>
                    </div>
                    <div className="mrgn-b-10">
                        <div className="vert-align-ctr">
                            <Icon type="bulb" className="fs18 mrgn-r-5"/>
                            <span className="italic bold">What's in the area:</span>
                        </div>
                        <div className="fs14 mrgn-l-25">{landmarksBlock}</div>
                    </div>
                    <div className="mrgn-b-10 mrgn-l-25">There is <span className="underlined bold">{neighbourhood}</span> in the neighborhood</div>
                    <Divider dashed/>

                    <div>
                        {!tripAdvisorReviewsBlock && !guestReviewsBlock ?
                            <>
                                <div className="mrgn-b-25 muted-text">No TripAdvisor or guest reviews yet</div>
                                <div className="mrgn-b-50 vert-align-ctr"/>
                            </> :
                            <>
                                {
                                    tripAdvisorReviewsBlock ?
                                        <div className="mrgn-b-10 vert-align-ctr">
                                            <IconFont className="fs20 mrgn-r-5" type="icon-tripadvisor"/>
                                            <span className="italic bold mrgn-r-10">TripAdvisor reviews:</span>
                                            {tripAdvisorReviewsBlock}
                                        </div> : <div className="mrgn-b-10 muted-text">No TripAdvisor reviews yet</div>
                                }
                                {
                                    guestReviewsBlock ?
                                        <>
                                            <div className="vert-align-ctr">
                                                <Icon type="team" className="fs18 mrgn-r-5"/>
                                                <div className="italic bold mrgn-r-10 flex-1">Guest reviews:</div>
                                            </div>
                                            <div className="mrgn-l-20">{guestReviewsBlock}</div>
                                        </>
                                        : <div className="mrgn-b-10 muted-text">No guest reviews yet</div>
                                }
                            </>
                        }
                        {
                            coupon &&
                            <div className="mrgn-b-10 vert-align-ctr">
                                <Icon type="percentage" className="fs18 mrgn-r-5"/>
                                <span className="italic bold mrgn-r-10">Coupon:</span>
                                {coupon}
                            </div>
                        }
                        {
                            dealsBlock &&
                            <div className="mrgn-b-10 vert-align-ctr">
                                <Icon type="gift" className="fs18 mrgn-r-5"/>
                                <span className="italic bold mrgn-r-10">Deals:</span>
                                {dealsBlock}
                            </div>
                        }
                    </div>

                    <div className="mrgn-t-20 text-centered pointer">
                        <Button type="dashed" onClick={this._showDrawer} icon="eye">
                            View rooms details
                        </Button>
                    </div>
                </div>
                <Drawer
                    title={`${hotelDetails.data.body.propertyDescription.name} details`}
                    width={1080}
                    onClose={this._onClose}
                    visible={this.state.isVisibleHotelDrawer}>
                    <ContentDrawer hotelDetails={hotelDetails}/>
                </Drawer>
            </Card>
        )
    }
}