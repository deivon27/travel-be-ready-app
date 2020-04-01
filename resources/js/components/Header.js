import React, {Component} from 'react'
import {Col, Dropdown, Icon, Menu, Row, Typography, Breadcrumb, Affix} from 'antd'
import {Link, withRouter} from 'react-router-dom'
import userService from '../services'
import {getLocalVal} from '../constants/utilities'

const {Text} = Typography


class Header extends Component {

    /**
     * TO-DO Finish up the method
     */

    _renderBreadcrumbEl = (key, linkData, types, titles) => {

        const isMultilink = linkData.includes('/')

        const splitLinks = isMultilink ? linkData.split('/') : linkData

        const hotelsItem = (
            <Menu>
                <Menu.Item key={50}>
                    <Link to={`/hotels`}>
                        <Icon type={`hdd`}/>
                        <span>{`Hotels`}</span>
                    </Link>
                </Menu.Item>
            </Menu>

        )

        const carRentalsItem = (
            <Menu>
                <Menu.Item key={51}>
                    <Link to={`/car-rentals`}>
                        <Icon type={`car`}/>
                        <span>{`Car rentals`}</span>
                    </Link>
                </Menu.Item>
            </Menu>
        )

        return (
            isMultilink ?
                splitLinks.map((link, i) => {
                    let key = i + 6
                    return (
                        link === 'car-rentals' ?
                            <Breadcrumb.Item key={key} overlay={hotelsItem}>
                                <Link to={`/${link}`}>
                                    <Icon type={types[i]}/>
                                    <span>{titles[i]}</span>
                                </Link>
                            </Breadcrumb.Item> :
                            link === 'hotels' ?
                                <Breadcrumb.Item key={key} overlay={carRentalsItem}>
                                    <Link to={`/${link}`}>
                                        <Icon type={types[i]}/>
                                        <span>{titles[i]}</span>
                                    </Link>
                                </Breadcrumb.Item>
                                :
                                <Breadcrumb.Item key={key}>
                                    <Link to={`/${link}`}>
                                        <Icon type={types[i]}/>
                                        <span>{titles[i]}</span>
                                    </Link>
                                </Breadcrumb.Item>

                    )
                }) :
                <Breadcrumb.Item key={key}>
                    <Link to={`/${linkData}`}>
                        <Icon type={types[0]}/>
                        <span>{titles[0]}</span>
                    </Link>
                </Breadcrumb.Item>
        )
    }

    constructor(props) {
        super(props)

        this.state = {
            user: {},
            users: [],
            topOffset: 0
        }
    }

    componentDidMount() {
        const user = getLocalVal('user', {})
        this.setState({
            user: user,
            users: {loading: true}
        })
        userService.getAll().then(users => this.setState({users}))
    }

    render() {
        const {user, users} = this.state
        const {breadcrumbReviewData, breadcrumbCarRentals, breadcrumbHotels, breadcrumbMap, breadcrumbFavorites, breadcrumbSettings} = this.props

        const menu = (
            <Menu>
                {
                    !breadcrumbMap &&
                    <Menu.Item key="0">
                        <Link to="/map">
                            <Icon type="environment"/>
                            <span>Map overview</span>
                        </Link>
                    </Menu.Item>
                }
                <Menu.Item key="1">
                    <Link to="/favorites">
                        <Icon type="heart"/>
                        <span>Favorites</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="2">
                    <Link to="/settings">
                        <Icon type="setting"/>
                        <span>Settings</span>
                    </Link>
                </Menu.Item>
                <Menu.Divider/>
                <Menu.Item key="3">
                    <Link to="/login">
                        <Text type="danger">
                            <Icon type="logout"/>
                            Log out
                        </Text>
                    </Link>
                </Menu.Item>
            </Menu>
        )

        const titles = {
            reviewCities: 'Review cities data',
            carRentals: 'Car rentals',
            hotels: 'Hotels',
            map: 'Map overview',
            fav: 'Favorites',
            settings: 'Settings'
        }

        return (
            <Affix offsetTop={this.state.topOffset}>
                <Row type="flex" className="header-row">
                    <Col span={4}>
                        <Link to="/">
                            <img alt="Travel - Be Ready App logo" src="../../images/logo-sm.png" className="logo-img"/>
                        </Link>
                    </Col>
                    <Col span={14}>
                        <Breadcrumb separator=">">
                            <Breadcrumb.Item key={1}>
                                <Link to="/">
                                    <Icon type="home"/>
                                    <span>Cities data</span>
                                </Link>
                            </Breadcrumb.Item>
                            {[
                                breadcrumbReviewData &&
                                this._renderBreadcrumbEl(2, 'review-data', ['eye'], [titles.reviewCities]),

                                breadcrumbCarRentals &&
                                this._renderBreadcrumbEl(3, 'review-data/map/car-rentals', ['eye', 'environment', 'car'], [titles.reviewCities, titles.map, titles.carRentals]),

                                breadcrumbHotels &&
                                this._renderBreadcrumbEl(4, 'review-data/map/hotels', ['eye', 'environment', 'hdd'], [titles.reviewCities, titles.map, titles.hotels]),

                                breadcrumbMap &&
                                this._renderBreadcrumbEl(5, 'review-data/map', ['eye', 'environment'], [titles.reviewCities, titles.map]),

                                breadcrumbFavorites &&
                                this._renderBreadcrumbEl(6, 'favorites', ['heart'], [titles.fav]),

                                breadcrumbSettings &&
                                this._renderBreadcrumbEl(6, 'settings', ['setting'], [titles.settings])
                            ]}
                        </Breadcrumb>
                    </Col>
                    <Col span={6} className="account-block">
                        <div className="inline welcome">Hi, {user.firstName}</div>
                        <span className="muted-text">|</span>
                        {users &&
                        <div className="inline my-account">
                            <Icon type="user" className="my-account-icon"/>
                            <Dropdown overlay={menu} trigger={['click']}>
                                <a className="ant-dropdown-link" href="#">
                                    My Account <Icon type="down"/>
                                </a>
                            </Dropdown>
                        </div>
                        }
                    </Col>
                </Row>
            </Affix>
        )
    }
}

export default withRouter(Header)