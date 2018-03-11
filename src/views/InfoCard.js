import React from 'react'
import '../styles/Station.css'

class InfoCard extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   show: false,
    //   stationName: '',
    //   stationPosition: {
    //     x: null,
    //     y: null
    //   }
    // }
  }

  componentDidUpdate() {
    console.log('infocard');
    console.log(this.props);
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
        <div className="header">{infoCard.stationName}</div>
        <div className="container"></div>
    </div>
    )
  }
}

export default InfoCard