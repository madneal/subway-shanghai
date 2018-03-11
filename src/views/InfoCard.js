import React from 'react'
import '../styles/Station.css'

class InfoCard extends React.Component {

  render() {
    const props = this.props;
    return (
    <div className="info-card">
        <div className="header">{props.stationName}</div>
        <div className="container"></div>
    </div>
    )
  }
}

export default InfoCard