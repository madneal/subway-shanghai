import React from 'react';
import Line from './Line';
import Station from './Station';
import InfoCard from './InfoCard';
import Label from './Label';
import meta from '../data/meta.json';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infoCard: {
        show: false,
        stationName: '',
        stationPosition: {
          x: null,
          y: null,
        },
        statid: null,
        timesheet: null,
      },
      stationInfo: null,
    };
  }

  convertShowInfoCard(infoCard, stationInfo) {
    this.setState({
      infoCard,
      stationInfo,
    });
  }

  changeInfoCard(infoCard) {
    this.setState({
      infoCard,
    });
  }

  closeInfoCard(e, isCloseFromInfoCard) {
    let isSvg = false;
    if (e.target.attributes.class) {
      isSvg = e.target.attributes.class.value === 'svg';
    }
    if ((isCloseFromInfoCard || isSvg) && this.state.infoCard.show) {
      const infoCard = { ...this.state.infoCard, show: false };
      this.setState({
        infoCard,
      });
    }
  }

  render() {
    const viewBox = meta.viewBox || '0 0 3080 2505';
    return (
      <div className="map" onClick={(e) => this.closeInfoCard(e, false)}>
        <svg className="svg" viewBox={viewBox} autoFocus>
          <Line />
          <Label />
          <Station
            convertShowInfoCard={(infoCard, stationInfo) =>
              this.convertShowInfoCard(infoCard, stationInfo)
            }
          />
        </svg>
        <InfoCard
          infoCard={this.state.infoCard}
          stationInfo={this.state.stationInfo}
          closeInfoCard={(e) => this.closeInfoCard(e, true)}
          changeInfoCard={(infoCard) => this.changeInfoCard(infoCard)}
        />
      </div>
    );
  }
}

export default Map;
