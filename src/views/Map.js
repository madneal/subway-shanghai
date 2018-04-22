import React from 'react';
import Line from './Line'
import asyncStation from './Station'
import asyncInfoCard from './InfoCard'
import asyncLabel from './Label'
const Station = asyncStation(() => import('./Station'))
const InfoCard = asyncInfoCard(() => import('./InfoCard'))
const Label = asyncLabel(() => import('./Label'))

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

  convertShowInfoCard(infoCard, stationInfo) {
    this.setState({
      infoCard: infoCard,
      stationInfo: stationInfo
    })
  }

  changeInfoCard(infoCard) {
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
        <Line />
        <Label />
        <Station convertShowInfoCard = {(infoCard, stationInfo) => this.convertShowInfoCard(infoCard, stationInfo)}/>
        </svg>
        <InfoCard infoCard={this.state.infoCard} stationInfo={this.state.stationInfo} closeInfoCard={e => this.closeInfoCard(e, true)} 
          changeInfoCard={(infoCard) => this.changeInfoCard(infoCard)}/>
      </div>
    )
  }
}


export default Map
