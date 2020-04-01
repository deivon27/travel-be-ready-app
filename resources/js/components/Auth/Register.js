import React, {Component} from 'react'
import {Card, Form, Input, Button, Checkbox, Typography, Row, Col, Spin} from 'antd'

//import unsplash from '../services/fetch.random.img'
//import {toJson} from 'unsplash-js'
import {Link} from "react-router-dom"

const {Text} = Typography


class RegisterForm extends Component {

    state = {
        confirmDirty: false,
        bgImage: '../images/login-register-image.jfif'
    }

    handleConfirmBlur = e => {
        const {value} = e.target;
        this.setState({confirmDirty: this.state.confirmDirty || !!value})
    }


    compareToFirstPassword = (rule, value, callback) => {
        const {form} = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!')
        } else {
            callback()
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        const {form} = this.props
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], {force: true})
        }
        callback()
    }

    /*componentWillMount() {
        unsplash.photos.getRandomPhoto({
            query: 'travel',
            orientation: 'portrait'
        })
            .then(toJson)
            .then(json => {
                this.setState({
                    bgImage: json.urls.small
                })
            })
    }*/

    render() {
        const {getFieldDecorator} = this.props.form

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 10},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14},
            },
        }

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 24},
            },
        }

        return (
            <div className="login-register-card">
                <img alt="Travel - Be Ready App logo" src="../../../images/logo-sm.png"
                     className="logo-img login-register-page"/>
                {!this.state.bgImage ? <Spin/> :
                    <Row className="login-register-row">
                        <Col xs={0} sm={0} md={10} lg={10} xl={10} className="login-register-col">
                            <img className="login-register-image" src={this.state.bgImage} alt="Login Image"/>
                        </Col>
                        <Col xs={24} sm={24} md={14} lg={14} xl={14}>
                            <Card>
                                <Text type="secondary" className="text-centered fs20 mrgn-b-20">Please register for
                                    enjoy
                                    your travel</Text>
                                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                                    <Form.Item label="E-mail">
                                        {getFieldDecorator('email', {
                                            rules: [
                                                {
                                                    type: 'email',
                                                    message: 'The input is not valid E-mail!',
                                                },
                                                {
                                                    required: true,
                                                    message: 'Please input your E-mail!',
                                                },
                                            ],
                                        })(<Input/>)}
                                    </Form.Item>
                                    <Form.Item label="Password" hasFeedback>
                                        {getFieldDecorator('password', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: 'Please input your password!',
                                                },
                                                {
                                                    validator: this.validateToNextPassword,
                                                },
                                            ],
                                        })(<Input.Password/>)}
                                    </Form.Item>
                                    <Form.Item label="Confirm Password" hasFeedback>
                                        {getFieldDecorator('confirm', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: 'Please confirm password!',
                                                },
                                                {
                                                    validator: this.compareToFirstPassword,
                                                },
                                            ],
                                        })(<Input.Password onBlur={this.handleConfirmBlur}/>)}
                                    </Form.Item>
                                    <Form.Item {...tailFormItemLayout}>
                                        {getFieldDecorator('agreement', {
                                            valuePropName: 'checked',
                                        })(<Checkbox>I have read the <a href="">agreement</a></Checkbox>)}
                                        <Button type="primary"
                                                htmlType="submit"
                                                className="login-form-button"
                                                block>
                                            Register
                                        </Button>
                                        Or <Link to="/login">login now!</Link>
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

const WrappedRegisterForm = Form.create({name: 'registerForm'})(RegisterForm)
export default WrappedRegisterForm