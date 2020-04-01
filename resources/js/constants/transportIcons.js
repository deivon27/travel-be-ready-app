import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

export const TransportIcons = (props) => {
    return (
        <div className="transport-block">
            <span onMouseOver={() => props._onHoverTransportIcon("with airplane?")}
                  onMouseLeave={props._onLeaveTransportIcon}
                  onClick={() => props._onToggleTransport(1)}
                  className={props.transportTypeSelected === 1 ? "hover-transport-span" : null}
            >
                <FontAwesomeIcon icon="plane" className="transport-icon"/>
                <div>Airplane</div>
            </span>
            <span onMouseOver={() => props._onHoverTransportIcon("on car?")}
                  onMouseLeave={props._onLeaveTransportIcon}
                  onClick={() => props._onToggleTransport(2)}
                  className={props.transportTypeSelected === 2 ? "hover-transport-span" : null}
            >
                <FontAwesomeIcon icon="car" className="transport-icon"/>
                <div>Car</div>
            </span>
            <span onMouseOver={() => props._onHoverTransportIcon("by train?")}
                  onMouseLeave={props._onLeaveTransportIcon}
                  onClick={() => props._onToggleTransport(3)}
                  className={props.transportTypeSelected === 3 ? "hover-transport-span" : null}
            >
                <FontAwesomeIcon icon="train" className="transport-icon"/>
                <div>Train</div>
            </span>
        </div>
    )
}