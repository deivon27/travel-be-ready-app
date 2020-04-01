import React, {Component} from 'react'
import {Card, Form, Icon, Input, Button, Checkbox, Typography, Row, Col, Spin} from 'antd'

/*import unsplash from '../services/fetch.random.img'
import {toJson} from 'unsplash-js'*/

import {Link, Redirect} from "react-router-dom"
import userService from '../../services/index'

const {Text} = Typography

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field])
}

class Login extends Component {

    constructor(props) {
        super(props)

        userService.logout()

        this.state = {
            username: '',
            password: '',
            submitted: false,
            loading: false,
            error: '',
            bgImage: '../images/login-register-image.jfif'
        }
    }

    handleChange = (e) => {

        const {name, value} = e.target
        /*this.props.form.setFieldsValue({
            [name]: value
        })*/
        this.setState({
            [name]: value
        })

        return value
    }

    handleSubmit = e => {
        e.preventDefault()

        this.setState({submitted: true})
        const {username, password} = this.state

        // stop here if form is invalid
        if (!(username && password)) {
            return
        }


        this.setState({loading: true})
        userService.login(username, password)
            .then(() => {
                    const {from} = this.props.location.state || {from: {pathname: "/"}}
                    this.props.history.push(from)
                },
                error => this.setState({error, loading: false})
            )
    }

    _requestRandomPhoto = (query) => {
        unsplash.photos.getRandomPhoto({
            //query: 'travel',
            featured: true,
            query: query
        })
            .then(toJson)
            .then(json => {
                //console.log(json.urls.thumb);
                /*this.setState({
                    bgImage: json.urls.small
                })*/
            })
    }

    componentWillMount() {
        //this._requestRandomPhoto('travel')
    }

    render() {
        //const {username, password, submitted, loading, error} = this.state

        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form

        // Only show error after a field is touched.
        const usernameError = isFieldTouched('username') && getFieldError('username')
        const passwordError = isFieldTouched('password') && getFieldError('password')

        return (
            <div className="login-register-card">
                <img alt="Travel - Be Ready App logo"
                     src="../../../images/logo-sm.png"
                     className="logo-img login-register-page"/>
                {!this.state.bgImage ? <Spin/> :
                    <Row className="login-register-row">
                        <Col xs={0} sm={0} md={10} lg={10} xl={10} className="login-register-col">
                            <img className="login-register-image" src={this.state.bgImage} alt="Login Image"/>
                        </Col>
                        <Col xs={24} sm={24} md={14} lg={14} xl={14}>
                            <Card>
                                <Text type="secondary" className="text-centered fs20 mrgn-b-20">Please login for enjoy
                                    your travel</Text>
                                <Form className="login-form">
                                    <Form.Item validateStatus={usernameError ? 'error' : ''} help={usernameError || ''}>
                                        {getFieldDecorator('username', {
                                            valuePropName: 'username',
                                            rules: [{required: true, message: 'Please input your username!'}],
                                            getValueFromEvent: this.onChange
                                        })(
                                            <Input
                                                name="username"
                                                prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                                placeholder="Username"
                                                onChange={this.handleChange}
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item validateStatus={passwordError ? 'error' : ''} help={passwordError || ''}>
                                        {getFieldDecorator('password', {
                                            valuePropName: 'password',
                                            rules: [{required: true, message: 'Please input your password!'}],
                                            getValueFromEvent: this.onChange
                                        })(
                                            <Input
                                                name="password"
                                                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                                type="password"
                                                placeholder="Password"
                                                onChange={this.handleChange}
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item>
                                        {getFieldDecorator('remember', {
                                            valuePropName: 'checked',
                                            initialValue: true,
                                        })(<Checkbox>Remember me</Checkbox>)}
                                        <a className="login-form-forgot" href="">Forgot password</a>
                                        <Button type="primary"
                                                htmlType="submit"
                                                className="login-form-button"
                                                disabled={hasErrors(getFieldsError())}
                                                block
                                                onClick={this.handleSubmit}>
                                            Log in
                                        </Button>
                                        Or <Link to="/register">register now!</Link>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                }
            </div>
        )
    }

}

const WrappedLoginForm = Form.create({name: 'loginForm'})(Login)
export default WrappedLoginForm