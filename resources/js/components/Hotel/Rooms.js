import React, {Component} from 'react'
import {
    Col,
    Divider,
    Icon,
    Row,
    Tooltip,
    Button,
    Badge,
    Tag,
    Modal,
    Tabs
} from 'antd'

const { TabPane } = Tabs
import {CarouselProvider, Slider, Slide, Image, ButtonBack, ButtonNext} from 'pure-react-carousel'
import {camelCaseToHumanReadeable} from "../../constants/utilities"



class RoomCarouselGallery extends Component {

    render() {

        const {array, classNameCarousel} = this.props

        return (
            <CarouselProvider className={classNameCarousel} naturalSlideWidth={80} totalSlides={array.length} isIntrinsicHeight>
                <Slider className="mrgn-b-10">
                    {array.length > 0 && array.map((item, key) => {
                        return (
                            <Slide index={key} key={key}>
                                <Image src={item.fullSizeUrl} alt={item.caption}/>
                            </Slide>
                        )
                    })}
                </Slider>

                <ButtonBack children={<Icon type="double-left"/>}
                            className="ant-btn ant-btn-icon-only button-prev"/>
                <ButtonNext children={<Icon type="double-right"/>}
                            className="ant-btn ant-btn-icon-only button-next"/>
            </CarouselProvider>
        )
    }
}


export default class ContentDrawer extends Component {

    state = {
        roomDetailsModalVisible: false,
        roomOpenKey: "0",
    }

    _showRoomDetailsModal = () => {
        this.setState((prevState) => ({
            roomDetailsModalVisible: !prevState.roomDetailsModalVisible
        }))
    }

    _onChangeRoom = key => {
        this.setState({
            roomOpenKey: key
        })
    }

    render() {


        const {roomDetailsModalVisible, roomOpenKey} = this.state
        const {roomsAndRates, _renderArrayItems, _renderSection, sectionRooms} = this.props

        //const bookingUrl = roomsAndRates.bookingUrl
        const rooms = roomsAndRates.rooms[roomOpenKey]

        const roomName = rooms.name
        const roomImages = rooms.images
        const bedChoices = rooms.bedChoices
        const bedChoicesBlock = (
            <>
                {_renderArrayItems(bedChoices, 'mainOptions', 'geekblue')}
                {_renderArrayItems(bedChoices, 'extraBedTypes', 'geekblue')}
            </>
        )
        const maxOccupancy = rooms.maxOccupancy
        const maxOccupancyBlock = (
            <>
                <div className="fs14 bold mrgn-b-5 mrgn-t-15">Maximum occupancy</div>
                <Badge className="fs13" color="geekblue" text={`${maxOccupancy.messageTotal} ${maxOccupancy.messageChildren}`}/>
            </>
        )

        const additionalInfo = rooms.additionalInfo
        const roomAmenities = additionalInfo.details.amenities
        const roomAmenitiesBlock = (
            <div>
                {roomAmenities.map((item, key) => {
                    return <div className="inline text-grey" key={key}>
                        <Icon type="check" className="text-blue-500 fs10"/>
                        <div className="mrgn-l-5 fs13">{item}</div>
                    </div>
                })}
            </div>
        )

        const ratePlans = rooms.ratePlans[0]
        const features = ratePlans.features
        const featuresBlock = (
            features.map((item, key) => {
                return (
                    <div key={key} className="inline">
                        <Icon className="mrgn-r-5" type={`${item.featureType === 'wifi' ? 'wifi' : 'coffee'}`}/>
                        <div className="fs14 bold">{item.info ? item.info : item.title}</div>
                    </div>
                )
            })
        )

        /** Rates, prices **/
        const priceObject = ratePlans.price
        const roomPrice = priceObject.current
        const roomOldPrice = priceObject.old
        const roomInfoPrice = priceObject.info

        const roomPriceNightlyPriceBreakdown = priceObject.nightlyPriceBreakdown
        const additionalColumns = roomPriceNightlyPriceBreakdown.additionalColumns

        const pricesBlock = (
            <div className="text-right">
                <Tag color="geekblue" className="mrgn-reset">
                    <div className="price mrgn-tb-5">
                        <span className="fs18 striked muted-text mrgn-r-5">{roomOldPrice}</span>
                        <span className="fs20 bold">{roomPrice}</span>
                    </div>
                    <div className="fs12 mrgn-tb-5">{roomInfoPrice}</div>
                </Tag>
                {additionalColumns
                    .filter(item => item.oldValue !== roomOldPrice && item.value !== roomPrice)
                    .map((item, key) => {
                        return (
                            <div key={key} className="mrgn-t-15">
                                <div className="price">
                                    <span className="fs14 striked muted-text mrgn-r-5">{item.oldValue}</span>
                                    <span className="fs16 bold">{item.value}</span>
                                </div>
                                <div className="fs12 mrgn-tb-5">{item.heading}</div>
                            </div>
                        )
                    })}
            </div>
        )


        /** Cancellations **/
        const cancellation = ratePlans.cancellation
        const cancellationBlock = (
            <>
                <div className="inline">
                    <Tag color="green">{cancellation.free && 'Free'}</Tag>
                    <span className="fs14 bold">{cancellation.additionalInfo}</span>
                </div>
                <Badge className="fs13 mrgn-t-10" color="geekblue" text={`${cancellation.info}`}/>
            </>
        )


        /** Rewards **/
        const welcomeRewards = ratePlans.welcomeRewards
        const rewardsBlock = (
            <>
                <div className="fs14 bold mrgn-b-5 mrgn-t-15">Loyalty program</div>
                <div className="fs13">{welcomeRewards.info}</div>

                {welcomeRewards.collect &&
                <div className="inline mrgn-r-10">
                    <Icon type="check-circle" className="fs12 text-green-900 mrgn-r-5"/>
                    <div>Collect</div>
                </div>
                }

                {welcomeRewards.redeem &&
                <div className="inline mrgn-r-10">
                    <Icon type="check-circle" className="fs12 text-green-900 mrgn-r-5"/>
                    <div>Redeem</div>
                </div>
                }
            </>
        )

        /** Offers **/
        const offers = ratePlans.offers
        const offer = offers.offer
        const offersBlock = (
            <div className="text-right mrgn-t-15">
                {_renderArrayItems(offers, 'valueAdds', 'blue')}
                <Tooltip placement="bottomRight" title={offer.text} className="pointer">
                    <Tag color="#f50" className="mrgn-reset">{camelCaseToHumanReadeable(offer.promoType)}</Tag>
                </Tooltip>
            </div>
        )

        /** Room details **/
        const roomDetails = (
            <Row>
                <Col span={8}>
                    {_renderSection('bars', 'Room details', <div className="fs14 description"
                                                                      dangerouslySetInnerHTML={{__html: additionalInfo.description}}/>)}
                </Col>
                <Col span={8}>
                    {_renderSection('desktop', 'Amenities', roomAmenitiesBlock)}
                </Col>
                <Col span={8}>
                    {_renderSection('stop', 'Cancellation', cancellationBlock)}
                </Col>
            </Row>
        )

        /**************************************/

        /*const ratePlanWithOffersExists = roomsAndRates.ratePlanWithOffersExists
        const priceColumnHeading = roomsAndRates.priceColumnHeading*/

        return (
            <>
                <Row className="mrgn-b-10 padding5 b-radius" id="rooms" style={{backgroundColor: sectionRooms}}>
                    <Divider dashed className="fs18 text-red-800">Select the room you desire</Divider>
                    <Tabs defaultActiveKey={roomOpenKey} onChange={this._onChangeRoom}>
                        {roomsAndRates.rooms.map((item, key) => {
                            return (
                                <TabPane tab={item.name} key={key}>
                                    <Row gutter={20}>
                                        {/* ROOM PHOTOS */}
                                        <Col span={10}>
                                            <RoomCarouselGallery classNameCarousel="room-carousel" array={roomImages}/>
                                            <Button block className="mrgn-t-20" type="primary" onClick={this._showRoomDetailsModal}>
                                                Show room information
                                            </Button>
                                        </Col>

                                        {/* ROOM DETAILS */}
                                        <Col span={10}>
                                            {featuresBlock}
                                            <Divider dashed/>
                                            {bedChoicesBlock}
                                            {maxOccupancyBlock}
                                            {rewardsBlock}
                                        </Col>

                                        {/* ROOM PRICES */}
                                        <Col span={4}>
                                            {pricesBlock}
                                            {offersBlock}
                                        </Col>
                                    </Row>
                                </TabPane>
                            )
                        })}
                    </Tabs>
                </Row>

                <Modal
                    width="50vw"
                    title={`"${roomName}" information`}
                    wrapClassName="hotel-internal-drawer"
                    visible={roomDetailsModalVisible}
                    onCancel={this._showRoomDetailsModal}
                    footer={null}
                >{roomDetails}</Modal>
            </>
        )
    }
}