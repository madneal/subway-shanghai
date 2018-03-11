import React from 'react'
import '../styles/Station.css'
import wcActive from '../imgs/wc.png'
import wcInactive from '../imgs/wc0.png'

class InfoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wc: false
    }
  }

  getStyle(infoCard) {
    return {
      display: infoCard.show ? 'block' : 'none',
      left: +infoCard.stationPosition.x - 130 + 'px',
      top: +infoCard.stationPosition.y - 20 + 'px'
    }
  }

  render() {
    const infoCard = this.props.infoCard;
    return (
    <div className="info-card" style={this.getStyle(this.props.infoCard)}>
        <div className="header">
          {infoCard.stationName}
          <span className="icons">
            <img src={this.state.wc ? wcActive : wcInactive}/>
          </span>
        </div>
        <div className="container"></div>
    </div>
    )
  }
}

export default InfoCard