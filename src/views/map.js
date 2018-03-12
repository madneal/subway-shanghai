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
        },
        statid: null
      }
    };
  }

  convertShowInfoCard(infoCard) {
    this.setState({
      infoCard: infoCard
    })
  }

  closeInfoCard(e) {
    if (!e.target.attributes['statid'] && this.state.infoCard.show) {
      this.state.infoCard.show = false;
      this.setState({
        infoCard: this.state.infoCard
      })
    }
  }


  render() {
    return (
      <div className="map" onClick={e => this.closeInfoCard(e)}>
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