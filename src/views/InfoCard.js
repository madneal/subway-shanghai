import React from 'react'
import '../styles/Station.css'
import wcActive from '../imgs/wc.png'
import wcInactive from '../imgs/wc0.png'
import elevatorActive from '../imgs/elevator.png'
import elevatorInactive from '../imgs/elevator0.png'
import entranceActive from '../imgs/exit.png'
import entranceInactive from '../imgs/exit0.png'

class InfoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wc: false,
      elevator: false,
      entrance: false
    }
  }

  getStyle(infoCard) {
    return {
      display: infoCard.show ? 'block' : 'none',
      left: +infoCard.stationPosition.x - 130 + 'px',
      top: +infoCard.stationPosition.y - 20 + 'px'
    }
  }

  changeState(stateName) {
    this.setState({
      stateName: !this.state[stateName]
    })
  }

  render() {
    const infoCard = this.props.infoCard;
    return (
    <div className="info-card" style={this.getStyle(this.props.infoCard)}>
        <div className="header">
          {infoCard.stationName}
          <span className="icons">
            <img src={this.state.wc ? wcActive : wcInactive} alt="卫生间"/>
            <img src={this.state.elevator ? elevatorActive : elevatorInactive} alt="无障碍电梯"/>
            <img src={this.state.entrance ? entranceActive : entranceInactive} alt="出入口"/>          
          </span>
        </div>
        <div className="container"></div>
    </div>
    )
  }
}

export default InfoCard