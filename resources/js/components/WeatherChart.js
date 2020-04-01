import React, {Component} from 'react'
import Chart from "react-apexcharts"


export default class WeatherChart extends Component {

    constructor(props) {
        super(props)

        //console.log(this.props.weekWeatherData);

        this.state = {
            options: {
                chart: {
                    id: 'basic-bar',
                    toolbar: {
                        show: false
                    }
                },
                plotOptions: {
                    bar: {
                        columnWidth: '60%',
                        // columnHeight: '70%',
                        dataLabels: {
                            position: 'top', // top, center, bottom
                        },
                        endingShape: 'rounded'
                    }
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val + "°"
                    },
                    offsetY: 20,
                    style: {
                        fontSize: '10px',
                        colors: ["#ffffff"]
                    }
                },
                xaxis: {
                    categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    /*position: 'top',
                    labels: {
                        offsetY: -18,
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    },
                    crosshairs: {
                        fill: {
                            type: 'gradient',
                            gradient: {
                                colorFrom: '#D8E3F0',
                                colorTo: '#BED1E6',
                                stops: [0, 100],
                                opacityFrom: 0.4,
                                opacityTo: 0.5,
                            }
                        }
                    },*/
                    /*tooltip: {
                        enabled: true,
                        offsetY: -35,
                    }*/
                },
                fill: {
                    gradient: {
                        shade: 'light',
                        type: "horizontal",
                        shadeIntensity: 0.25,
                        gradientToColors: undefined,
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [50, 0, 100, 100]
                    },
                },
                yaxis: {
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false,
                    },
                    labels: {
                        show: false,
                        formatter: function (val) {
                            return val + "°";
                        }
                    }
                },
                title: {
                    text: 'Average temperature/wind speed for this week',
                    floating: true,
                    offsetY: 5,
                    align: 'center',
                    style: {
                        color: '#444',
                        fontSize: '13px',
                    }
                }
            },
            series: [{
                name: 'Low temperature',
                data: this.props.weekWeatherData.lowTemp
            }, {
                name: 'High temperature',
                data: this.props.weekWeatherData.highTemp
            }/*, {
                name: 'Wind speed',
                data: this.props.weekWeatherData.windSpeed
            }*/]
        }
    }

    render() {
        return (
            <div id="chart">
                <Chart options={this.state.options} series={this.state.series} type="bar" height="auto"/>
            </div>
        )
    }
}
