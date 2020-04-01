import React from 'react'
import ReactDOM from 'react-dom'
import {HashRouter as Router} from 'react-router-dom'
import {Provider} from 'react-redux'
import {AppContainer} from 'react-hot-loader'

import {library} from '@fortawesome/fontawesome-svg-core'
import {faCalendarCheck, faCar, faPlane, faTrain} from '@fortawesome/free-solid-svg-icons'

import store from '../store'
import App from './NavApp'

// setup fake backend
import {configureFakeBackend} from '../helpers'

configureFakeBackend()

library.add([faPlane, faCar, faTrain, faCalendarCheck])


if (document.querySelector('#root')) {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <Router>
                    <App/>
                </Router>
            </Provider>
        </AppContainer>,
        document.querySelector('#root')
    )
}

if (process.env.NODE_ENV === 'development' && module.hot) {module.hot.accept()}