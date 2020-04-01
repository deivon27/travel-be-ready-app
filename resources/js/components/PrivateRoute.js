import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import {getLocalVal} from '../constants/utilities'

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        getLocalVal('user', 'guest', false)
            ? <Component {...props} />
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />
)

export default PrivateRoute