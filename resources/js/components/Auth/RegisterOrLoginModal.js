import React, {Component} from 'react'
import {Modal, Form, Divider} from 'antd'
import WrappedLoginForm from "./Login"
import WrappedRegisterForm from "./Register"


class RegisterLoginForm extends Component {

    //state = {visible: this.props.isShownRegisterLogin}
    state = {visible: true}


    handleOk = () => {
        this.setState({
            visible: false,
        })
    }

    handleCancel = () => {
        this.setState({
            visible: false
        })
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
            }
        })
    }

    componentDidMount() {
        // To disabled submit button at the beginning.
        this.props.form.validateFields()
    }

    render() {
        return (
            <div>
                <Modal
                    title="Please log in"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={null}
                >
                    <WrappedLoginForm/>
                    <Divider/>
                    <WrappedRegisterForm/>
                </Modal>
            </div>
        )
    }
}

const WrappedRegisterLoginForm = Form.create({ name: 'registerLoginForm' })(RegisterLoginForm)
export default WrappedRegisterLoginForm