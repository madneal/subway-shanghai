import React from 'react';
import Line from './Line'
// import Station from './Station'
import asyncStation from './Station'
import asyncInfoCard from './InfoCard'
import Label from './Label'
const Station = asyncStation(() => import('./Station'))
const InfoCard = asyncInfoCard(() => import('./InfoCard'))

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
      },
      stationInfo: null
    };
  }

  convertShowInfoCard(infoCard) {
    this.setState({
      infoCard: infoCard
    })
  }

  closeInfoCard(e, isCloseFromInfoCard) {
    let isSvg = false;
    if (e.target.attributes.class) {
      isSvg = e.target.attributes.class.value === 'svg';
    }
    if ((isCloseFromInfoCard || isSvg) && this.state.infoCard.show) {
      const infoCard = this.state.infoCard;
      infoCard.show = false;
      this.setState({
        infoCard: infoCard
      })
    }
  }


  render() {
    return (
      <div className="map" onClick={e => this.closeInfoCard(e, false)}>
        <svg className="svg" viewBox="0 0 2300 2300" autoFocus>
        <Label />
        <Line />
        <Station convertShowInfoCard = {(infoCard, stationInfo) => this.convertShowInfoCard(infoCard)}/>
        </svg>
        <InfoCard infoCard = {this.state.infoCard} closeInfoCard={e => this.closeInfoCard(e, true)}/>
      </div>
    )
  }
}


export default Map
