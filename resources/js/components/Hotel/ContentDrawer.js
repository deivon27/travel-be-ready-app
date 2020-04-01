import React, {Component} from 'react'
import {
    Col,
    Divider,
    Icon,
    Row,
    Rate,
    Tooltip,
    Button,
    Badge,
    Statistic,
    Tag,
    Descriptions,
    Collapse,
    Popover
} from 'antd'

const {Panel} = Collapse

import {CarouselProvider, Slider, Slide, Image, ButtonBack, ButtonNext, Dot} from 'pure-react-carousel'

import ScrollIntoView from 'react-scroll-into-view'
import * as URLS from "../../constants/urls"
import {callApi, stripeHtml, camelCaseToHumanReadeable, _renderSection, getLocalVal} from "../../constants/utilities"
import roomsAndRatesData from '../../constants/roomsAndRates'
import Rooms from './Rooms'

const IconFont1 = Icon.createFromIconfontCN({scriptUrl: '//at.alicdn.com/t/font_1307335_jzcbsutd7nn.js'})

const section = {
    rooms: '',
    overview: '',
    transports: '',
    detailsSummary: '',
    hotelReviews: '',
    amenities: '',
    goodToKnow: '',
    specialFeatures: ''
}


class CarouselGallery extends Component {

    render() {

        const {array, classNameCarousel} = this.props

        return (
            <CarouselProvider className={classNameCarousel} naturalSlideWidth={80} totalSlides={array.length} isIntrinsicHeight>
                <Slider className="mrgn-b-10">
                    {array.length > 0 && array.map((item, key) => {
                        return (
                            <Slide index={key} key={key}>
                                <Image src={item.baseUrl.replace('{size}', 'z')} alt={`${item.imageId} ${key}`}/>
                            </Slide>
                        )
                    })}
                </Slider>

                <ButtonBack children={<Icon type="double-left"/>}
                            className="ant-btn ant-btn-primary ant-btn-circle ant-btn-lg ant-btn-icon-only button-prev"/>
                <ButtonNext children={<Icon type="double-right"/>}
                            className="ant-btn ant-btn-primary ant-btn-circle ant-btn-lg ant-btn-icon-only button-next"/>

                <Row className="mrgn-b-10">
                    {array.length > 0 && array.map((item, key) => {
                        return <Dot key={key} slide={key} className="no-border-padding dot-element"
                                    children={<img className="dot-image" src={item.baseUrl.replace('{size}', 't')}
                                                   alt={`${item.imageId} ${key}`} style={{width: 70}}/>}/>
                    })}
                </Row>
            </CarouselProvider>
        )
    }
}


export default class ContentDrawer extends Component {

    state = {
        isMapWidgetShown: false,
        section: section,
        hotelPhotos: getLocalVal('hotelPhotos', []),
        roomImagesArray: []

    }

    _onSwitchMapWidget = () => {
        this.setState((prevState) => ({
            isMapWidgetShown: !prevState.isMapWidgetShown
        }), () => {
            this._showScrolledToEl('map-image')
        })
    }

    _renderEl = (value) => {
        return value && value
    }

    _renderArrayItems = (entity, index, badgeColor) => {
        return (
            entity[index].length > 0 ?
                <>
                    <div className={`fs14 bold mrgn-b-5 ${index !== 0 && 'mrgn-t-15'}`}>{camelCaseToHumanReadeable(index)}</div>
                    <div className="flex-vertical">
                        {
                            index === 'alternativeNames' ?
                                <Collapse bordered={false}>
                                    <Panel header={`${entity[index][0]}, ${entity[index][1]}`} key={entity[index]}>
                                        {entity[index].length > 0 && entity[index].map((item, key) => {
                                            return (key !== 0 && key !== 1) &&
                                                <div key={key}><Badge className="fs13" color={badgeColor} text={stripeHtml(item)}/></div>
                                        })}
                                    </Panel>
                                </Collapse> :
                                entity[index].length > 0 && entity[index].map((item, key) => {
                                    return <Badge key={key} className="fs13" color={badgeColor} text={stripeHtml(item)}/>
                                })
                        }
                    </div>
                </> :
                <>
                    {entity[index].length > 0 &&
                    <div className="fs14 bold mrgn-b-5 mrgn-t-15">{camelCaseToHumanReadeable(index)}</div>}
                    <div>
                        {Object.keys(entity[index]).map((item, key) => {
                            return (
                                entity[index][item].length > 0 &&
                                <div key={key}>
                                    <div className="fs14 bold mrgn-tb-5">{camelCaseToHumanReadeable(item)}</div>
                                    <div className="flex-vertical">
                                        {entity[index][item].map((item, key) => <Badge key={key} className="fs13" color={badgeColor}
                                                                                       text={stripeHtml(item)}/>)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
        )
    }

    _clearSelection = () => {
        this.setState({section: {}})
    }

    _showScrolledToEl = (id) => {
        let section = this.state.section
        section[id] = ''

        Object.keys(section).forEach(c => section[c] = 0) // Resets to initial styling
        section[id] = 'rgba(227, 52, 47, 0.1)'

        this.setState({section: section})

        const sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms))
        }

        sleep(2000).then(() => {
            this._clearSelection()
        })
    }

    _getHotelPhotos = async () => {
        const url = URLS.URL_HOTEL_PHOTOS
        const headers = {
            'x-rapidapi-host': URLS.xRapidapiHost,
            "x-rapidapi-key": URLS.xRapidapiKey
        }
        const response = await callApi({
            "id": "634418464"
        }, 'GET', headers, url, true)

        console.info('_getHotelPhotos: ')
        console.info(response)

        if (response.result === "OK") {
            this.setState({
                hotelPhotos: response
            }, () => {
                window.localStorage.setItem('hotelPhotos', JSON.stringify(response['data']))
            })
        } else {
            this.setState({
                hotelPhotos: []
            })
        }
        return response
    }

    _distinctArray = (array, prop) => {
        return array.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
        })
    }

    _distinctAndUniqueRooms = () => {
        const {hotelPhotos} = this.state

        let roomsPhotos = [],
            prop = 'imageId'
        hotelPhotos.roomImages.map(i => i.images.map(i => roomsPhotos.push(i)))
        const result = this._distinctArray(roomsPhotos, prop)

        this.setState({roomImagesArray: result})
    }

    componentDidMount() {
        //return this._getHotelPhotos()
        this._distinctAndUniqueRooms()
    }

    render() {

        const {hotelDetails} = this.props
        const {isMapWidgetShown, hotelPhotos, roomImagesArray} = this.state

        const body = hotelDetails.data.body

        body['roomsAndRates'] = roomsAndRatesData

        const transportation = hotelDetails.transportation
        const neighborhoodName = hotelDetails.neighborhood.neighborhoodName

        const pdpHeader = body.pdpHeader
        const overview = body.overview
        const hotelWelcomeRewards = body.hotelWelcomeRewards
        const hotelRewardsImg = "images/rewards-logo-white-moon-it_IT.png"
        const propertyDescription = body.propertyDescription
        const guestReviews = body.guestReviews
        const atAGlance = body.atAGlance
        const amenities = body.amenities
        const smallPrint = body.smallPrint
        const specialFeatures = body.specialFeatures
        /*const trustYouReviewsCredit = body.trustYouReviewsCredit*/
        const hotelBadge = body.hotelBadge

        /** 1 Pdp Header **/
        /********* ********/
        const hotelId = pdpHeader.hotelId
        /*const currencyCode = pdpHeader.currencyCode*/
        const coordinates = pdpHeader.hotelLocation.coordinates
        const locationName = pdpHeader.hotelLocation.locationName


        /** 2 Property Description **/
        /************ ***************/
        const address = propertyDescription.address
        const name = propertyDescription.name
        const starRatingTitle = propertyDescription.starRatingTitle
        const starRating = propertyDescription.starRating
        const featuredPrice = propertyDescription.featuredPrice

        const mapWidgetSize = "834x443"
        const mapWidget = `https://maps-api-ssl.google.com/maps/api/staticmap?center=${coordinates.latitude},${coordinates.longitude}&format=jpg&key=${URLS.googleMapsApiKey}&zoom=16&size=${mapWidgetSize}`

        /*const roomTypeNames = propertyDescription.roomTypeNames
        const roomTypeNamesBlock = roomTypeNames.map((item, key) => {
            return (
                <Col key={key} span={24 / roomTypeNames.length} className="inline centered">
                    <Badge key={key} className="fs13" color="magenta" text={item}/>
                </Col>
            )
        })*/

        const tagline = propertyDescription.tagline
        const freebies = propertyDescription.freebies.map((item, key) => {
            return (
                <div key={key} className="inline mrgn-r-20">
                    <Icon type="check-circle" className="fs16 text-green-900 mrgn-r-5"/>
                    <div>{item}</div>
                </div>
            )
        })


        /** 3 Overview **/
        /********* ******/
        const overviewSections = overview.overviewSections
        const overviewSectionsBlock = overviewSections.map((item, key) => {
            return item.type !== 'TAGLINE' && item.type !== 'HOTEL_FREEBIES' &&
                <Col span={8} key={key}>
                    <div className="fs14 bold mrgn-b-5">{item.title}</div>
                    <div>
                        {item.content.map((item, key) => {
                            return <div className="inline text-grey" key={key}>
                                <Icon type="check" className="text-blue-500 fs10"/>
                                <div className="mrgn-l-5 fs13">{item}</div>
                            </div>
                        })}
                    </div>
                </Col>
        })


        /** 4 Transportation **/
        /********** ***********/
        const transportLocations = transportation.transportLocations
        const transportLocationsBlock = transportLocations.map((item, key) => {
            return (
                <Col span={24 / transportLocations.length} key={key}>
                    <div className="fs14 bold mrgn-b-5">{(item.category).toUpperCase()}</div>
                    {item.locations.map((location, key) => {
                        return (
                            <div key={key} className="inline">
                                <Badge key={key} className="fs13" color="gold" text={location.name}/>
                                <span className="mrgn-l-5 italic">{location.distanceInTime}</span>
                            </div>
                        )
                    })}
                </Col>
            )
        })


        /** 5 At A Glance **/
        /********* *********/
        const keyFacts = atAGlance.keyFacts
        const keyFactsBlock = (
            <Col key={1} span={8}>
                {this._renderArrayItems(keyFacts, 'hotelSize', 'cyan')}
                {this._renderArrayItems(keyFacts, 'arrivingLeaving', 'cyan')}
                {this._renderArrayItems(keyFacts, 'specialCheckInInstructions', 'cyan')}
                {this._renderArrayItems(keyFacts, 'requiredAtCheckIn', 'cyan')}
            </Col>
        )

        const travellingOrInternet = atAGlance.travellingOrInternet
        const travellingOrInternetBlock = (
            <Col key={2} span={8}>
                {this._renderArrayItems(travellingOrInternet, 'internet', 'cyan')}
                {this._renderArrayItems(travellingOrInternet, 'travelling', 'cyan')}
            </Col>
        )

        const transportAndOther = atAGlance.transportAndOther
        const transportAndOtherBlock = (
            <Col key={3} span={8}>
                {this._renderArrayItems(transportAndOther, 'otherInclusions', 'cyan')}
                {this._renderArrayItems(transportAndOther, 'otherInformation', 'cyan')}
                {this._renderArrayItems(transportAndOther, 'transport', 'cyan')}
            </Col>
        )


        /** 6 Guest reviews **/
        /********* ***********/
        const brands = guestReviews.brands

        const _badgeColor = (rating) => {
            let color = ''
            if (rating >= 0 && rating <= 3) color = 'red'
            if (rating > 3 && rating <= 7) color = 'orange'
            if (rating > 7 && rating <= 10) color = 'green'
            return color
        }

        const brandsBlock = brands &&
            <div className="vert-align-ctr">
                <Icon className="fs18" type="team"/>
                <div className="fs14 mrgn-l-5">By guests:</div>
                <Tag className="fs22 mrgn-l-10 padding5" color={_badgeColor(brands.rating)}>{brands.badgeText}</Tag>
                <Statistic className="mrgn-l-5" value={brands.formattedRating} suffix={`/ ${brands.scale}`}/>
                <span className="fs13 mrgn-l-5 text-grey">{`(${brands.total} reviewers)`}</span>
            </div>

        const _sentimentIcon = (sentiment) => <Icon type={`${sentiment === 'pos' ? 'smile' : 'meh'}`}/>

        const trustYouReviews = guestReviews.trustYouReviews
        const trustYouReviewsBlock = trustYouReviews.map((item, key) => {
            return (
                <Col key={key} span={24 / trustYouReviews.length}>
                    {/*<div className="fs16 bold mrgn-t-10">{item.categoryName}</div>*/}
                    <div className="fs20 vert-align-ctr precise">
                        {_sentimentIcon(item.sentiment)}&nbsp;&nbsp;
                        {`${item.percentage}%`}
                    </div>
                    <div className="fs16">{item.text}</div>
                </Col>
            )
        })
        const trustYouLogo = "images/trustyou-logo.png"

        const tripAdvisor = guestReviews.tripAdvisor
        //const tripAdvisor = {"rating": 4.5, "total": 5370}
        const tripAdvisorBlock = tripAdvisor &&
            <div className="vert-align-ctr">
                <IconFont1 className="fs24" type="icon-tripadvisor"/>
                <div className="fs14 mrgn-l-5">Tripadvisor:</div>
                <Statistic className="mrgn-l-5" value={tripAdvisor.rating} suffix="/ 5"/>
                <span className="fs13 mrgn-l-5 text-grey">{`(${tripAdvisor.total} reviewers)`}</span>
            </div>

        const hotelReviewsBlock = (
            <Row className="vert-align-ctr precise">
                <Col span={10}>
                    <Row><Col>{brandsBlock}</Col></Row>
                    <Row><Col>{tripAdvisorBlock}</Col></Row>
                </Col>
                <Col span={14}>
                    <Row className="mrgn-b-10">
                        <Col className="inline centered">
                            <img src={trustYouLogo} style={{width: 150}} alt="TrustYou reviews logo"/>
                        </Col>
                    </Row>
                    <Row>{trustYouReviewsBlock}</Row>
                </Col>
            </Row>
        )

        /** 7 Amenities **/
        /********* *******/
        const amenitiesBlock = (
            amenities.map((item, key) => {
                const heading = item.heading
                const listItems = item.listItems
                return (
                    <Row className="mrgn-t-20" key={key}>
                        <Descriptions title={heading} layout="horizontal" size="small" column={1} bordered>
                            {listItems.map((item, key) => {
                                const items = item.listItems
                                return (
                                    <Descriptions.Item key={key} label={item.heading}>
                                        {items.map((item, key) => {
                                            return <span key={key} className={`${items.length > 1 && "pipe-right smaller"}`}>{item}</span>
                                        })}
                                    </Descriptions.Item>
                                )
                            })}
                        </Descriptions>
                    </Row>
                )
            })
        )

        /** 8 Good to know **/
        /********* **********/
        /** TO-DO: figure out the need of the fields below **/
        /*const mandatoryTaxesOrFees = smallPrint.mandatoryTaxesOrFees
        const display = smallPrint.display*/

        const goodToKnowBlock = (
            <>
                <Col span={12}>
                    {this._renderArrayItems(smallPrint, 'mandatoryFees', 'purple')}
                    {this._renderArrayItems(smallPrint, 'optionalExtras', 'purple')}
                </Col>
                <Col span={12}>
                    {this._renderArrayItems(smallPrint, 'policies', 'purple')}
                    {this._renderArrayItems(smallPrint, 'alternativeNames', 'purple')}
                </Col>
            </>
        )


        /** 9 Special Features **/
        /*********** ************/
        const sections = specialFeatures.sections
        const sectionsBlock = sections.map((item, key) => {
            const textArray = (item.freeText).split('<br/>')
            return (
                <Col key={key} span={12}>
                    <div className="fs14 bold mrgn-b-5 mrgn-t-15">{camelCaseToHumanReadeable(item.heading)}</div>
                    {textArray.length > 0 && textArray.map((item, key) => {
                        return <Badge key={key} className="fs13" color="lime" text={stripeHtml(item)}/>
                    })}
                </Col>
            )
        })


        /** 10 Hotel Badge **/
        /********* **********/
        const hotelBadgeLabel = hotelBadge.label
        const hotelBadgeTooltipTitle = hotelBadge.tooltipTitle
        const hotelBadgeTooltipText = hotelBadge.tooltipText
        const hotelBadgeBlock = (
            <Popover content={hotelBadgeTooltipText}
                     title={hotelBadgeTooltipTitle}
                     trigger={['hover', 'click']}>
                <Tag color="volcano" className="fs16 pointer">{hotelBadgeLabel}</Tag>
            </Popover>
        )

        const fullAddress = this._renderEl(address.fullAddress)
        const beforePriceText = this._renderEl(featuredPrice.beforePriceText)
        const pricingAvailability = this._renderEl(featuredPrice.pricingAvailability)
        const pricingTooltip = this._renderEl(featuredPrice.pricingTooltip)
        const price = this._renderEl(featuredPrice.currentPrice.formatted)

        const navigationLinks = [
            {'rooms': 'Rooms'},
            {'overview': 'Overview'},
            {'transports': 'Transports'},
            {'detailsSummary': 'Details summary'},
            {'hotelReviews': 'Hotel reviews'},
            {'amenities': 'Amenities'},
            {'goodToKnow': 'Good to know'},
            {'specialFeatures': 'Special features'}
        ]
        const hotelImages = roomImagesArray.length > 0 && this._distinctArray([...hotelPhotos.hotelImages, ...roomImagesArray], 'imageId')


        return (
            <div key={hotelId} className="hotel-internal-drawer">
                <Row className="mrgn-b-10" type="flex" justify="center">
                    <Col span={24}>
                        <CarouselGallery classNameCarousel="hotel-carousel" array={hotelImages}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={21}>
                        <div className="inline mrgn-b-5 text-grey">
                            <div className="fs22 bold mrgn-r-10">{name}</div>
                            <div className="fs18">{`(${locationName})`}</div>
                        </div>
                        <div className="fs14 mrgn-b-5">
                            {tagline.map((item, key) => <div key={key} dangerouslySetInnerHTML={{__html: item}}/>)}
                        </div>
                        <div className="vert-align-ctr mrgn-b-5">
                            <Icon type="environment" className="fs18 mrgn-r-5"/>
                            Address: &nbsp;
                            <Button type="link" onClick={this._onSwitchMapWidget}>{fullAddress}</Button>
                            <Icon type={`caret-${isMapWidgetShown ? 'up' : 'down'}`} className="text-grey"/>
                        </div>
                        <div className="fs13 mrgn-b-5 text-grey">There is <span className="underlined bold">{neighborhoodName}</span> in the
                            neighborhood
                        </div>
                        <div id="map-image">
                            {isMapWidgetShown && <img className="bordered-grey" style={{width: '60%'}} src={mapWidget} alt=""/>}
                        </div>
                    </Col>

                    <Col span={3} className="text-right">
                        <div className="fs12">{beforePriceText}</div>
                        <Tooltip placement="left" title={pricingTooltip}>
                            <div className="inline right pointer">
                                <Icon className="mrgn-r-5" type="question-circle"/>
                                <div className="fs24 bold">{price}</div>
                            </div>
                        </Tooltip>
                        <div className="fs12">{pricingAvailability}</div>
                    </Col>
                </Row>
                <Row className="vert-align-ctr">
                    <Col span={4}>
                        <Tooltip placement="top" title={starRatingTitle}>
                            {starRating && <Rate disabled size="small" defaultValue={starRating}/>}
                        </Tooltip>
                    </Col>
                    <Col span={16} className="inline">
                        {freebies.length > 0 && freebies}
                        {hotelBadgeBlock}
                    </Col>
                    <Col span={4} className="align-right">
                        <Tooltip placement="topLeft" title={hotelWelcomeRewards.applies && hotelWelcomeRewards.info}>
                            <div className="header-img pointer">
                                <img src={hotelRewardsImg} alt=""/>
                            </div>
                        </Tooltip>
                    </Col>
                </Row>
                <Divider dashed/>
                <Row className="mrgn-b-10 padding5">
                    <div className="inline">
                        <div>Navigate to:</div>
                        {navigationLinks.map((item, key) => {
                            const itemKey = Object.keys(item)
                            return (
                                <div key={key} className="pipe-right smaller">
                                    <ScrollIntoView selector={`#${itemKey}`}>
                                        <Button type="link" size="small" onClick={() => this._showScrolledToEl(itemKey)}>{item[itemKey]}</Button>
                                    </ScrollIntoView>
                                </div>
                            )
                        })}
                    </div>
                </Row>

                {/*<Divider dashed/>
                <Row className="mrgn-b-10 bg-gray" id="rooms" style={{backgroundColor: this.state.section.rooms}}>
                    {this._renderSection('home', 'Room types', roomTypeNamesBlock)}
                </Row>*/}

                <Rooms
                    roomsAndRates={body.roomsAndRates}
                    _renderArrayItems={this._renderArrayItems}
                    _renderSection={_renderSection}
                    sectionRooms={this.state.section.rooms}
                />

                <Divider dashed/>
                <Row className="mrgn-b-10 padding5 b-radius" id="overview"
                     style={{backgroundColor: this.state.section.overview}}>{_renderSection('profile', 'Overview', overviewSectionsBlock)}</Row>
                <Divider dashed/>
                <Row className="mrgn-b-10 bg-gray" id="transports"
                     style={{backgroundColor: this.state.section.transports}}>{_renderSection('car', 'Transports', transportLocationsBlock)}</Row>
                <Divider dashed/>
                <Row className="mrgn-b-10 padding5 b-radius" id="detailsSummary"
                     style={{backgroundColor: this.state.section.detailsSummary}}>{_renderSection('bars', 'Details summary', [
                    keyFactsBlock, travellingOrInternetBlock, transportAndOtherBlock
                ])}</Row>
                <Divider dashed/>
                <Row className="mrgn-b-10 bg-gray guest-reviews" id="hotelReviews"
                     style={{backgroundColor: this.state.section.hotelReviews}}>{_renderSection('star', 'Hotel reviews', hotelReviewsBlock)}</Row>
                <Divider dashed/>
                <Row className="mrgn-b-10 padding5 b-radius" id="amenities"
                     style={{backgroundColor: this.state.section.amenities}}>{_renderSection('desktop', 'Amenities', amenitiesBlock)}</Row>
                <Divider dashed/>
                <Row className="mrgn-b-10 bg-gray" id="goodToKnow"
                     style={{backgroundColor: this.state.section.goodToKnow}}>{_renderSection('sound', 'Good to know', goodToKnowBlock)}</Row>
                <Divider dashed/>
                <Row className="mrgn-b-10 padding5 b-radius" id="specialFeatures"
                     style={{backgroundColor: this.state.section.specialFeatures}}>{_renderSection('coffee', 'Special features', sectionsBlock)}</Row>
                <Divider/>
            </div>
        )
    }
}