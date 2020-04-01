import React, {Component} from "react"
import {Row, Col, Slider, Icon, Progress} from "antd"
import Sound from "react-sound"

import {getTime} from "../constants/utilities"


const musicPlaylist = [
    {id: 1, title: "SoundHelix-Song-1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},
    {id: 2, title: "SoundHelix-Song-10", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"}
]

export default class Music extends Component {
    state = {
        player: this.props.player,
        currentTime: 0,
        duration: 0,
        volume: 2,
        loading: false,
        selectedTrack: musicPlaylist.filter(i => i.id === 1)[0],
        percentLoaded: 0
    }

    _onLoading = () => {
        this.setState({
            loading: true
        })
    }

    _onLoad = () => {
        this.setState({
            loading: false
        })
    }

    _onPlaying = audio => {
        //console.log(audio)
        this.setState({
            currentTime: audio.position,
            duration: audio.duration,
            percentLoaded: 100 / (audio.duration / audio.position)
        })
    }

    _onFinishedPlaying = () => {

    }

    _onSwitchStatus = () => {
        this.setState({
            player: this.state.player === Sound.status.PLAYING ?
                Sound.status.PAUSED :
                Sound.status.PLAYING
        })
    }

    _onSwitchTrack = (direction) => {
        let trackId = this.state.selectedTrack.id
        const newTrackId = direction === 'next' ? trackId + 1 : trackId - 1
        const isTrackExist = musicPlaylist.filter(i => i.id === newTrackId).length > 0

        isTrackExist &&
        this.setState({
            selectedTrack: musicPlaylist.filter(i => i.id === newTrackId)[0]
        })
    }

    render() {
        const {miniVersion} = this.props
        const {player, volume, currentTime, duration, selectedTrack, loading, percentLoaded} = this.state

        const currentTimeMinutes = getTime(currentTime)
        const durationMinutes = getTime(duration)

        const selectedTrackNode = (
            <div key={selectedTrack.id}>
                <div>{selectedTrack.title}</div>
            </div>
        )

        return (
            <div className="music-player">
                <Row type="flex" justify="space-around" align="middle">
                    <Col span={`${miniVersion ? 24 : 4}`}>
                        <div className="inline vert-align-ctr player-icons">
                            <Icon type={`${player === Sound.status.PLAYING ? 'pause-circle' : 'play-circle'}`}
                                  className="fs32 pointer"
                                  onClick={this._onSwitchStatus}
                            />
                            <Icon type="step-backward"
                                  className="fs18 pointer mrgn-l-10"
                                  onClick={() => this._onSwitchTrack('prev', selectedTrack.id)}
                            />
                            <Icon type="step-forward"
                                  className="fs18 pointer mrgn-l-5"
                                  onClick={() => this._onSwitchTrack('next', selectedTrack.id)}/>
                        </div>

                    </Col>
                    {/*<Col span={6}>
                        <Button onClick={() => this.setState({player: Sound.status.STOPPED})} shape="round" icon="poweroff"
                                disabled={player !== Sound.status.PLAYING && player !== Sound.status.PAUSED}>
                            </Button>
                    </Col>*/}

                    <Col span={14} className={`${miniVersion ? 'hidden' : ''}`}>
                        <div className="mrgn-l-10 mrgn-r-10 fs13">
                            {selectedTrackNode}
                            <Progress percent={percentLoaded}
                                      size="small"
                                      showInfo={false}
                                      status={loading ? 'active' : 'normal'}
                                      strokeColor={"rgba(112, 171, 220, .5)"}
                            />
                        </div>
                    </Col>

                    <Col span={3} className={`${miniVersion ? 'hidden' : ''}`}>
                        <div className="fs12">
                            {currentTimeMinutes} / {durationMinutes}
                        </div>
                    </Col>

                    <Col span={3} className={`${miniVersion ? 'hidden' : ''}`}>
                        <Slider defaultValue={volume} onChange={value => this.setState({volume: value})}/>
                    </Col>
                </Row>

                <Sound
                    url={selectedTrack.url}
                    playStatus={player}
                    volume={volume}
                    /*position={currentTime}*/
                    loop
                    onLoading={this._onLoading}
                    onLoad={this._onLoad}
                    onPlaying={this._onPlaying}
                    onFinishedPlaying={this._onFinishedPlaying}
                />

                <div className="music-player-bg"/>
            </div>
        )
    }
}
