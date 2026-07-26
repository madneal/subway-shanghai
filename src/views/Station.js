import React from 'react';
import stations from '../data/stations.json';
import transfers from '../data/transfers.json';
import stationInfos from '../data/stationInfo.json';
import transferPath from '../imgs/transfer.png';
import { formatTimesheet } from '../utils/timesheet';

class Station extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lastStation: null,
    };
  }

  getAttVal(attributes, attrName) {
    if (attributes[attrName]) {
      if (attrName === 'cx' || attrName === 'cy') {
        return attributes[attrName];
      }
      return attributes[attrName].value;
    }
    return null;
  }

  /**
   * Read an SVG coordinate. Prefer DOM attributes (works under jsdom tests)
   * and fall back to SVGAnimatedLength in real browsers.
   */
  getCoordinate(target, attrNames) {
    for (const name of attrNames) {
      if (target.getAttribute) {
        const fromAttr = target.getAttribute(name);
        if (fromAttr != null && fromAttr !== '') {
          return fromAttr;
        }
      }
      const animated = target[name];
      if (animated && animated.baseVal) {
        if (animated.baseVal.valueAsString != null) {
          return animated.baseVal.valueAsString;
        }
        if (typeof animated.baseVal.value === 'number') {
          return String(animated.baseVal.value);
        }
      }
    }
    return null;
  }

  convertShow(e) {
    const attributes = e.target.attributes;
    const stationName =
      this.getAttVal(attributes, 'id') || this.getAttVal(attributes, 'dataid');
    if (!stationName) {
      return;
    }

    const x = this.getCoordinate(e.target, ['x', 'cx']);
    const y = this.getCoordinate(e.target, ['y', 'cy']);
    if (x == null || y == null) {
      return;
    }
    const position = {
      x: +x + 100,
      y: +y + 70,
    };
    const statId = this.getAttVal(attributes, 'statid');
    const stationInfo = stationInfos[statId];
    if (!stationInfo || !stationInfo.timesheet) {
      return;
    }

    let timesheet = formatTimesheet(stationInfo.timesheet);
    const infoCard = {
      show: true,
      stationName,
      stationPosition: position,
      statId,
      timesheet,
    };

    if (this.state.lastStation === null) {
      this.setState({ lastStation: statId });
    } else if (statId !== this.state.lastStation) {
      const keys = Object.keys(timesheet);
      if (keys.length !== 0) {
        infoCard.currentLine = keys[0];
      }
      this.setState({ lastStation: statId });
    }

    this.props.convertShowInfoCard(infoCard, stationInfo);
  }

  render() {
    const stationEles = [];
    const transferEles = [];

    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      stationEles.push(
        <circle
          cx={station.cx}
          cy={station.cy}
          r="5"
          fill="white"
          stroke={station.stroke}
          id={station.id}
          statid={station.statid}
          key={(station.id || 'station') + i}
        />
      );
    }

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      transferEles.push(
        <image
          x={transfer.x}
          y={transfer.y}
          dataid={transfer['data-id']}
          href={transferPath}
          xlinkHref={transferPath}
          statid={transfer.statid}
          key={transfer['data-id'] + i}
          height="16"
          width="16"
        />
      );
    }

    return (
      <g onClick={(e) => this.convertShow(e)}>
        {stationEles}
        {transferEles}
      </g>
    );
  }
}

export default Station;
