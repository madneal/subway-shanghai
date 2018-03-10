import React from 'react'
import stations from '../data/stations.json'
import transfers from '../data/transfers.json'

class Station extends React.Component {
  render() {
    const stationEles = [];
    const transferEles = [];

    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      stationEles.push(
        <circle cx={station.cx} cy={station.cy} r="5" fill="white" stroke={station.stroke} id={station.id} key={station.id + i}></circle>
      )
    }

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      transferEles.push(
        <image x={transfer.x} y={transfer.y} dataId={station['data-id']} href="../../public/image/transfer.png" key={station['data-id'] + i}></image>
      )
    }
    return (
      <g>{stationEles}</g>
    )
  }
}

export default Station