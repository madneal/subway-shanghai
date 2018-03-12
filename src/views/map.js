import React from 'react';
import Line from './Line'
import Station from './Station'
import InfoCard from './InfoCard'
import Label from './Label'

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

    return (
      <div className="map">
        <svg className="svg" viewBox="0 0 2300 2300" autoFocus>
        <Label />
        <Line />
        <Station convertShowInfoCard = {infoCard => this.convertShowInfoCard(infoCard)}/>
        </svg>
        <InfoCard infoCard = {this.state.infoCard}/>
      </div>
    )
  }
}


export default Map