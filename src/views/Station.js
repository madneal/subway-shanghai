import React from 'react'
import stations from '../data/stations.json'
import transfers from '../data/transfers.json'
import transferPath from '../imgs/transfer.png'
import InfoCard from './InfoCard'

class Station extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    }
    this.convertShow = this.convertShow.bind(this);
  }

  convertShow() {
    this.setState(preState => {
      show: !preState.show
    });
  }

  render() {
    const stationEles = [];
    const transferEles = [];
    let InfoCardDiv = null;

    if (this.state.show) {
      InfoCardDiv = <InfoCard />
    }

    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      stationEles.push(
        <circle cx={station.cx} cy={station.cy} r="5" fill="white" stroke={station.stroke} id={station.id} key={station.id + i}></circle>
      )
    }

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      transferEles.push(
        <image x={transfer.x} y={transfer.y} dataid={transfer['data-id']} href={transferPath} key={transfer['data-id'] + i}></image>
      )
    }

    return (
      <g onClick={this.convertShow}>
        {stationEles}
        {transferEles}
        {InfoCardDiv}
      </g>
    )
  }
}

export default Station