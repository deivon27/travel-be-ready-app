import React, {Component} from 'react'
import {
    Col,
    Form,
    Layout,
    Row,
    Select,
    Empty,
    Spin,
    Pagination,
    BackTop,
    Button,
    Icon,
    Cascader,
    Tooltip
} from 'antd'

import HotelItem from "../Hotel/HotelItem"

const {Content} = Layout


export default class ContentHotels extends Component {

    _renderSortFilter = (sortResults) => {

        const {
            popularOrderFilter,
            starRatingsOrderFilter,
            distanceOrderFilter,
            distanceOrderFilterTitle,
            guestRatingOrderFilter,
            priceOrderFilter,

            _onChangeDistanceOrderFilter,
            _onChangeStarRatingsOrderFilter,
            _onChangePriceOrderFilter,
            _onSwitchPopularOrderFilter,
            _onSwitchGuestRatingOrderFilter
        } = this.props

        /*console.log(`popularOrderFilter: ${popularOrderFilter}`)
        console.log(`starRatingsOrderFilter: ${starRatingsOrderFilter}`)
        console.log(`distanceOrderFilter: ${distanceOrderFilter}`)
        console.log(`guestRatingOrderFilter: ${guestRatingOrderFilter}`)
        console.log(`priceOrderFilter: ${priceOrderFilter}`)
        console.log('*************************************************')*/

        let result = []

        sortResults.map((item, key) => {
            const selectValue = item.choices.filter(i => i.selected === true).map(i => i.value)
            const selectPlaceholder = item.label ? item.label : item.selectedChoiceLabel

            if (item.itemMeta === 'popular') {
                return result.push(
                    <Form.Item key={key} /*label="Sort by: "*/ colon labelCol={{span: 8}} wrapperCol={{span: 16}}>
                        <Button className={`${popularOrderFilter ? 'button-def-focused' : ''} hor-filter-button`}
                                onClick={_onSwitchPopularOrderFilter}>Featured
                            {popularOrderFilter && <Icon type="check-circle" className="muted-text text-blue-900"/>}
                        </Button>
                    </Form.Item>
                )
            }
            if (item.itemMeta === 'star') {
                const value = starRatingsOrderFilter ? starRatingsOrderFilter : selectValue
                return result.push(
                    <Form.Item key={key} colon={false}>
                        <Select defaultValue={value}
                                value={value}
                                placeholder={selectPlaceholder}
                                className="hor-filter"
                                onChange={_onChangeStarRatingsOrderFilter}>
                            {item.choices.map((option, key) => {
                                return <Select.Option key={key} value={option.value} title={option.label}>{option.label}</Select.Option>
                            })}
                        </Select>
                    </Form.Item>
                )
            }
            if (item.itemMeta === 'distance') {
                const enhancedChoices = item.enhancedChoices.map(item => {
                    return {
                        value: item.itemMeta,
                        label: item.label,
                        children: item.choices.map(choice => {
                            return {
                                value: choice.id,
                                label: choice.label
                            }
                        }),
                    }
                })

                const defaultValue = distanceOrderFilter.length > 0 ? [String(distanceOrderFilter[0]), Number(distanceOrderFilter[1])] : []
                return result.push(
                    <Form.Item key={key} colon={false}>
                        <Tooltip placement="top" title={distanceOrderFilterTitle && distanceOrderFilterTitle}>
                            <Cascader
                                defaultValue={defaultValue}
                                value={defaultValue}
                                placeholder={item.choices[0].label}
                                className="hor-filter"
                                options={enhancedChoices}
                                expandTrigger="hover"
                                onChange={_onChangeDistanceOrderFilter}
                            />
                        </Tooltip>
                    </Form.Item>
                )
            }
            if (item.itemMeta === 'rating') {
                return result.push(
                    <Form.Item key={key} colon={false}>
                        <Button className={`${guestRatingOrderFilter ? 'button-def-focused' : ''} hor-filter-button`}
                                onClick={_onSwitchGuestRatingOrderFilter}>Guest Rating
                            {guestRatingOrderFilter && <Icon type="check-circle" className="muted-text text-blue-900"/>}
                        </Button>
                    </Form.Item>
                )
            }
            if (item.itemMeta === 'price') {
                const value = priceOrderFilter ? priceOrderFilter : selectValue
                return result.push(
                    <Form.Item key={key} colon={false}>
                        <Select defaultValue={value}
                                value={value}
                                placeholder={selectPlaceholder}
                                className="hor-filter"
                                onChange={_onChangePriceOrderFilter}>
                            {item.choices.map((option, key) => {
                                return <Select.Option key={key} value={option.value} title={option.label}>{option.label}</Select.Option>
                            })}
                        </Select>
                    </Form.Item>
                )
            }
        })

        return result
    }

    shouldComponentUpdate(nextProps, nextState) {
        //return this.props !== nextProps

        return this.props.popularOrderFilter !== nextProps.popularOrderFilter ||
            this.props.starRatingsOrderFilter !== nextProps.starRatingsOrderFilter ||
            this.props.distanceOrderFilter !== nextProps.starRatingsOrderFilter ||
            this.props.distanceOrderFilterTitle !== nextProps.starRatingsOrderFilter ||
            this.props.guestRatingOrderFilter !== nextProps.starRatingsOrderFilter ||
            this.props.priceOrderFilter !== nextProps.starRatingsOrderFilter
    }

    render() {

        const {
            hotels,
            hotelsListLoading,
            pageNumber,
            pageSize,
            checkinDate,
            checkoutDate,
            qtyDays,
            currencyConvertedResult,
            currencySymbol
        } = this.props

        const sortResults = hotels.body.sortResults.options
        sortResults.length === 4 &&
        sortResults.push(
            {
                "label": "Featured",
                "itemMeta": "popular",
                "choices": [{
                    "label": "Featured",
                    "value": "BEST_SELLER",
                    "selected": false
                }],
                "enhancedChoices": []
            }
        )

        let contentToRender = null

        if (hotelsListLoading) {
            contentToRender = <div className="text-centered"><Spin size="large"/></div>
        } else {
            const searchResults = hotels && hotels.body.searchResults
            if (searchResults) {
                const hotelData = searchResults.results

                if (hotelData.length > 0) {
                    contentToRender = (
                        hotelData.map((hotelData, key) => {
                            return (
                                <Col key={key} xs={{span: 24}} md={{span: 24}} lg={{span: 24}} xl={{span: 12}} style={{position: 'relative'}}>
                                    <HotelItem key={key}
                                               hotelId={hotelData.id}
                                               hotelData={hotelData}
                                               qtyDays={qtyDays}
                                               currencyConvertedResult={currencyConvertedResult}
                                               currencySymbol={currencySymbol}
                                               checkinDate={checkinDate}
                                               checkoutDate={checkoutDate}
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
        }

        return (
            <Content className="content">
                <Row gutter={16}>
                    <Col xs={{span: 24}} md={{span: 24}} lg={{span: 10}} xl={{span: 10}}>
                        <div className="fs24">Hotels at New York (near John Kennedy Airport)</div>
                        <div className="fs14 mrgn-tb-10">{hotels['body']['searchResults']['totalCount']} results found</div>
                    </Col>
                    <Col xs={{span: 24}} md={{span: 24}} lg={{span: 14}} xl={{span: 14}}>
                        <Form layout="inline" className="text-right">
                            {sortResults.length > 0 && this._renderSortFilter(sortResults)}
                        </Form>
                    </Col>
                </Row>
                <Row type="flex" justify="space-around" align="middle" gutter={10}>{contentToRender}</Row>
                <Row type="flex" justify="space-around" align="middle" gutter={10} className="mrgn-tb-20">
                    <Col>
                        <BackTop/>
                        <Pagination hideOnSinglePage showQuickJumper defaultCurrent={pageNumber} current={pageNumber} total={100}
                                    onChange={this.props._onChangePage}/>
                    </Col>
                </Row>
            </Content>
        )
    }
}
