import React from 'react';
import labels from '../data/labels.json'
import Line from './Line'
import Station from './Station'
import InfoCard from './InfoCard';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infoCard: {
        show: false,
        stationName: '',
        stationPosition: {
          x: null,
          y: null
        }
      }
    };
  }

  convertShowInfoCard(infoCard) {
    this.setState({
      infoCard: infoCard
    })
  }

  render() {
    const labelElements = [];
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      labelElements.push(<text x={label.x} y={label.y} fill={label.fill} key={label.text + i}>{label.text}</text>);
    }
    return (
      <div className="map">
        <svg className="svg" viewBox="0 0 2300 2300" autoFocus>
        {labelElements}
        <Line />
        <Station convertShowInfoCard = {infoCard => this.convertShowInfoCard(infoCard)}/>
        </svg>
        <InfoCard infoCard = {this.state.infoCard}/>
      </div>
    )
  }
}


export default Map