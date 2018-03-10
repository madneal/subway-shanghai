import React from 'react'
import stations from '../data/stations.json'

class Station extends React.Component {
  render() {
    const stationEles = [];
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      stationEles.push(
        <circle cx={station.cx} cy={station.cy} r="5" fill="white" stroke={station.stroke} id={station.id} key={station.id + i}></circle>
      )
    }
    return (
      <g>{stationEles}</g>
    )
  }
}

export default Station