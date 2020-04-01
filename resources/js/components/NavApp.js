import React, {Component} from 'react'
import {Router, Route, Switch, withRouter} from 'react-router-dom'


import Login from "./Auth/Login"
import Register from "./Auth/Register"
import Entry from "./CitiesSelect/Entry"
import Favorites from "./Favorites"
import Settings from "./Settings"
import ReviewCityData from "./CitiesSelect/ReviewCityData"
import MapCityData from "./Maps/MapCityData"
import CarRentals from "./CarRental/CarRentals"
import Hotels from "./Hotel/Hotels"
import PrivateRoute from "./PrivateRoute"
import Sound from "react-sound";
import Music from "./Music";

/* Wrapper for withRouter */
const WrappedApp = withRouter(props => <NavApp {...props}/>)

class NavApp extends Component {
    render() {
        return (
            <>
                <Switch>
                    <Route path="/login" component={Login}/>
                    <Route path="/register" component={Register}/>
                    <PrivateRoute path="/" exact component={Entry}/>
                    <PrivateRoute path="/review-data" component={ReviewCityData}/>
                    <PrivateRoute path="/map" component={MapCityData}/>
                    <PrivateRoute path="/car-rentals" component={CarRentals}/>
                    <PrivateRoute path="/hotels" component={Hotels}/>
                    <PrivateRoute path="/favorites" component={Favorites}/>
                    <PrivateRoute path="/settings" component={Settings}/>
                </Switch>
                <Music player={Sound.status.STOPPED} miniVersion/>
            </>
        )
    }
}

export default WrappedApp