import React, {Component} from 'react'
import locale from "antd/lib/date-picker/locale/it_IT"
import {
    Col,
    DatePicker,
    Divider,
    Form,
    Icon,
    Row,
    Select,
    Input,
    InputNumber,
    Rate,
    Button,
    Layout
} from 'antd'

const {Sider} = Layout

import {getLocalVal} from '../../constants/utilities'


class SiderHotels extends Component {

    state = {
        idFieldAdults: 1,
        idFieldChildren: 1,
    }

    _addAdultsField = () => {
        const {form} = this.props
        const keys = form.getFieldValue('keysAdults')
        const nextKeys = keys.concat(this.state.idFieldAdults++)
        form.setFieldsValue({keysAdults: nextKeys})
    }

    _removeAdultsField = (value, key) => {
        const {form} = this.props
        const keys = form.getFieldValue('keysAdults')
        form.setFieldsValue({
            keysAdults: keys.filter(key => key !== value),
            idFieldAdults: this.state.idFieldAdults--
        }, () => window.localStorage.removeItem(key))
    }

    _addChildrenField = () => {
        const {form} = this.props
        const keys = form.getFieldValue('keysChildren')
        const nextKeys = keys.concat(this.state.idFieldChildren++)
        form.setFieldsValue({keysChildren: nextKeys})
    }

    _removeChildrenField = (value, key) => {
        const {form} = this.props
        const keys = form.getFieldValue('keysChildren')
        form.setFieldsValue({
            keysChildren: keys.filter(key => key !== value),
            idFieldChildren: this.state.idFieldChildren--
        }, () => window.localStorage.removeItem(key))
    }

    _renderSelectOptions = (array) => {
        return array.map((item, i) => {
            return <Select.Option key={i} value={item.value}>{item.label}</Select.Option>
        })
    }

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form
        const {
            checkinDate,
            checkoutDate,
            accommodations,
            facilities,
            landmarks,
            accommodationsSelected,
            facilitiesSelected,
            landmarksSelected,
            priceMin,
            priceMax,
            starRatings,
            guestRatingMin,
            currencyTo,
            currencySymbol,
            _onChangeCheckinDate,
            _onChangeCheckoutDate,
            _onChangeAccommodationsFilter,
            _onChangeFacilitiesFilter,
            _onChangeLandmarksFilter,
            _onChangePriceMinFilter,
            _onChangePriceMaxFilter,
            _onChangeAdultsChildrenFilter,
            _onChangeStarRatingsFilter,
            _onChangeGuestRatingMinFilter,
            _onChangeCurrencyFilter,
            _onBlurFilter
        } = this.props
        const {idFieldAdults, idFieldChildren} = this.state

        /*const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        }

        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span: 24, offset: 0},
                sm: {span: 20, offset: 4},
            },
        }*/

        /*const roomsOrAdults = [...Array(9).keys()]*/

        /** Generate adults and children dynamic fields values from LocalStorage (in case these values exists) **/
        let adultsValues = []
        let childrenValues = []

        for (let i = 2; i < 9; i++) {
            let adultsValue = Number(getLocalVal(`adults${i}`, 0, false))
            adultsValue && adultsValues.push(adultsValue)

            let childrenValue = getLocalVal(`children${i}`, 0, false)
            childrenValue && childrenValues.push(childrenValue.split(','))
        }

        getFieldDecorator('keysAdults', {initialValue: adultsValues})
        getFieldDecorator('keysChildren', {initialValue: childrenValues})
        const keysAdults = getFieldValue('keysAdults')
        const keysChildren = getFieldValue('keysChildren')

        /** Adults dynamic fields generation **/
        const adultsFields = keysAdults.map((value, index) => (
            <Col span={12} key={`a${index}`}>
                <Form.Item label={`in the ${index + 2} room`} required={false} colon className="mrgn-b-15">
                    {getFieldDecorator(`adults[${index + 2}]`, {
                        initialValue: value,
                        validateTrigger: ['onBlur'],
                        rules: [{
                            required: true,
                            whitespace: false,
                            message: "Please input adult's number or delete this field",
                        }],
                        onChange: e => _onChangeAdultsChildrenFilter(`adults${index + 2}`, e)
                    })(
                        <InputNumber min={1} max={5}/>
                    )}
                    <Icon className="mrgn-l-5 fs18 delete-dynamic-field" type="delete" onClick={() => this._removeAdultsField(value, `adults${index + 2}`)}/>
                </Form.Item>
            </Col>
        ))

        /** Children ages selectbox values **/
        const childrenFieldsVal = []
        for (let i = 1; i < 9; i++) {
            childrenFieldsVal.push(<Select.Option key={`${i}${Math.random().toFixed(2)*100}`} value={String(i)}>{i}</Select.Option>)
        }

        /** Children dynamic fields generation **/
        const childrenFields = keysChildren.map((value, index) => (
            <Col span={24} key={`c${index}`}>
                <Form.Item label={`in the ${index + 2} room`} required={false} colon className="mrgn-b-15">
                    {getFieldDecorator(`children[${index + 2}]`, {
                        initialValue: value,
                        /*validateTrigger: ['onBlur'],
                        rules: [{
                            required: true,
                            whitespace: true,
                            message: "Please input children ages or delete this field"
                        }],*/
                        onChange: e => _onChangeAdultsChildrenFilter(`children${index + 2}`, e)
                    })(<Select className="fs12 width90" mode="tags" placeholder="Children ages">{childrenFieldsVal}</Select>)}
                    <Icon className="mrgn-l-5 fs18 delete-dynamic-field" type="delete" onClick={() => this._removeChildrenField(value, `children${index + 2}`)}/>
                </Form.Item>
            </Col>
        ))

        return (
            <Sider className="sider-hotels" theme={"light"} width={334}>
                <Form>
                    <Divider orientation="left" className="text-red-800 fs14" dashed>Booking related filters</Divider>
                    <Form.Item label="Check in date" colon className="mrgn-b-15">
                        <DatePicker
                            locale={locale}
                            format="YYYY-MM-DD"
                            className="input"
                            value={checkinDate}
                            defaultValue={checkinDate}
                            placeholder="Check in date"
                            onChange={_onChangeCheckinDate}
                        />
                    </Form.Item>

                    <Form.Item label="Check out date" colon className="mrgn-b-15">
                        <DatePicker
                            locale={locale}
                            format="YYYY-MM-DD"
                            className="input"
                            value={checkoutDate}
                            defaultValue={checkoutDate}
                            placeholder="Check out date"
                            onChange={_onChangeCheckoutDate}
                        />
                    </Form.Item>

                    <Form.Item label="Accommodations" colon className="mrgn-b-15">
                        <Select mode="tags"
                                className="fs12"
                                placeholder="Select accommodations"
                                dropdownClassName="fs12"
                                defaultValue={accommodationsSelected}
                                onChange={_onChangeAccommodationsFilter}>
                            {this._renderSelectOptions(accommodations)}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Amenities" colon className="mrgn-b-15">
                        <Select mode="tags" className="fs12"
                                placeholder="Select amenities"
                                dropdownClassName="fs12"
                                defaultValue={facilitiesSelected}
                                onChange={_onChangeFacilitiesFilter}>
                            {this._renderSelectOptions(facilities)}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Landmarks" colon className="mrgn-b-15">
                        <Select mode="tags" className="fs12"
                                placeholder="Select landmarks"
                                dropdownClassName="fs12"
                                defaultValue={landmarksSelected}
                                onChange={_onChangeLandmarksFilter}>
                            {this._renderSelectOptions(landmarks)}
                        </Select>
                    </Form.Item>

                    <Divider orientation="left" className="fs14 text-red-800" dashed>How much would you spend?</Divider>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item label="Min" colon className="mrgn-b-15">
                                <Input
                                    prefix={currencySymbol}
                                    name="priceMin"
                                    className="input"
                                    value={priceMin}
                                    defaultValue={priceMin}
                                    onChange={_onChangePriceMinFilter}
                                    onBlur={_onBlurFilter}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Max" colon className="mrgn-b-15">
                                <Input
                                    prefix={currencySymbol}
                                    name="priceMax"
                                    className="input"
                                    value={priceMax}
                                    defaultValue={priceMax}
                                    onChange={_onChangePriceMaxFilter}
                                    onBlur={_onBlurFilter}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" className="fs14 text-red-800" dashed>The number of adults</Divider>
                    <Row gutter={8}>
                        <Col span={11}>
                            <Form.Item label="in the 1 room" colon className="mrgn-b-15">
                                <InputNumber min={1} max={5}
                                             defaultValue={Number(getLocalVal('adults1', 1, false))}
                                             onChange={e => _onChangeAdultsChildrenFilter(`adults1`, e)}
                                />
                            </Form.Item>
                        </Col>

                        {
                            idFieldAdults < 8 &&
                            <Col span={13}>
                                <Form.Item label={<span className="fs12 muted-text italic">Will there be more adults?</span>}
                                           colon={false} className="mrgn-b-15">
                                    <Button type="dashed" onClick={this._addAdultsField}>
                                        <Icon type="plus" className="circle-button"/>
                                        <span className="fs12">Add another room</span>
                                    </Button>
                                </Form.Item>
                            </Col>
                        }

                    </Row>
                    <Row gutter={4}>{adultsFields}</Row>

                    <Divider orientation="left" className="fs14 text-red-800" dashed>The children ages</Divider>
                    <Row gutter={8}>
                        <Col span={11}>
                            <Form.Item label="in the 1 room" colon className="mrgn-b-15">
                                <Select mode="tags"
                                        placeholder="Children ages"
                                        className="fs12"
                                        defaultValue={getLocalVal('children1', 0, false).split(',')}
                                        onChange={e => _onChangeAdultsChildrenFilter(`children1`, e)}>{childrenFieldsVal}</Select>
                            </Form.Item>
                        </Col>
                        {
                            idFieldChildren < 8 &&
                            <Col span={13}>
                                <Form.Item label={<span className="fs12 muted-text italic">Will there be more children?</span>}
                                           colon={false}
                                           className="mrgn-b-15"
                                >
                                    <Button type="dashed" onClick={this._addChildrenField}>
                                        <Icon type="plus" className="circle-button"/>
                                        <span className="fs12">Add another room</span>
                                    </Button>
                                </Form.Item>
                            </Col>
                        }
                    </Row>
                    <Row gutter={4}>{childrenFields}</Row>

                    <Divider orientation="left" className="fs14 text-red-800" dashed>Other filters</Divider>
                    <Form.Item label="Hotel star rating" colon className="mrgn-b-15 rate-grey-item">
                        <Rate size="small"
                              character={<Icon type="star" className="fs26 rate-grey"/>}
                              value={starRatings}
                              onChange={_onChangeStarRatingsFilter}
                        />
                    </Form.Item>

                    <Form.Item label="Minimum guest rating" colon className="mrgn-b-15">
                        <Rate size="small"
                              count={10}
                              value={guestRatingMin}
                              onChange={_onChangeGuestRatingMinFilter}
                        />
                    </Form.Item>

                    <Form.Item label="Currency" size="small" colon className="mrgn-b-15">
                        <Select defaultValue={currencyTo} onChange={_onChangeCurrencyFilter}>
                            <Select.Option value="EUR">Euro (EUR)</Select.Option>
                            <Select.Option value="USD">Dollar (USD)</Select.Option>
                            <Select.Option value="RUB">Ruble (RUB)</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Sider>
        )
    }
}


const WrappedSiderHotels = Form.create({name: 'dynamic_form_item'})(SiderHotels)
export default WrappedSiderHotels