import React from 'react'
import stations from '../data/stations.json'
import transfers from '../data/transfers.json'
import transferPath from '../imgs/transfer.png'
import InfoCard from './InfoCard'

class Station extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      stationName: null
    }
    this.convertShow = this.convertShow.bind(this);
  }

  getAttVal(attributes) {
    let value = null;
    if (attributes.id) {
      value = attributes.id.value;
    } else if (attributes.dataid) {
      value = attributes.dataid.value;
    }
    return value;
  }

  convertShow(e) {
    const attributes = e.target.attributes;
    const value = this.getAttVal(attributes);
    this.setState(preState => {
      preState.show = !preState.show;
      preState.stationName = value;
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
      <g onClick={e => this.convertShow(e)}>
        {stationEles}
        {transferEles}
        {InfoCardDiv}
      </g>
    )
  }
}

export default Station