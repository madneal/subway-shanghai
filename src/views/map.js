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
        statid: null,
        timesheet: null
      }
    };
  }

  convertShowInfoCard(infoCard) {
    this.setState({
      infoCard: infoCard
    })
  }

  closeInfoCard(e) {
    let isSvg = false;
    if (e.target.attributes.class) {
      isSvg = e.target.attributes.class.value === 'svg';
    }
    if (isSvg && this.state.infoCard.show) {
      const infoCard = this.state.infoCard;
      infoCard.show = false;
      this.setState({
        infoCard: infoCard
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