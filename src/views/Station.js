import React from 'react';
import stations from '../data/stations.json';
import transfers from '../data/transfers.json';
import stationInfos from '../data/stationInfo.json';
import transferPath from '../imgs/transfer.png';
import { formatTimesheet } from '../utils/timesheet';

/**
 * Convert a click on the SVG into coordinates relative to the scrollable .map box,
 * so the floating info card can sit next to the station on screen.
 */
function mapRelativePoint(e) {
  const mapEl = e.currentTarget.closest('.map');
  if (!mapEl) {
    return { x: e.clientX, y: e.clientY };
  }
  const rect = mapEl.getBoundingClientRect();
  return {
    x: e.clientX - rect.left + mapEl.scrollLeft,
    y: e.clientY - rect.top + mapEl.scrollTop,
  };
}

/**
 * Place the card near the station, preferring bottom-right, flipping if near edges.
 */
function cardAnchor(point, mapEl) {
  const OFFSET = 14;
  const CARD_W = 360;
  const CARD_H = 280;
  const mapW = mapEl ? mapEl.scrollWidth : point.x + CARD_W;
  const mapH = mapEl ? mapEl.scrollHeight : point.y + CARD_H;

  let x = point.x + OFFSET;
  let y = point.y + OFFSET;

  if (x + CARD_W > mapW - 8) {
    x = point.x - CARD_W - OFFSET;
  }
  if (y + CARD_H > mapH - 8) {
    y = point.y - CARD_H - OFFSET;
  }

  return {
    x: Math.max(8, x),
    y: Math.max(8, y),
  };
}

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

    // Prefer SVG station coords for svgX/svgY (data); screen placement from click.
    const svgX = this.getCoordinate(e.target, ['x', 'cx']);
    const svgY = this.getCoordinate(e.target, ['y', 'cy']);
    const mapEl = e.currentTarget.closest('.map');
    const clickPt = mapRelativePoint(e);
    const position = cardAnchor(clickPt, mapEl);

    const statId = this.getAttVal(attributes, 'statid');
    const stationInfo = stationInfos[statId] || {
      timesheet: [],
      elevator: '',
      entranceInfo: '',
      toiletPosition: '',
    };

    const timesheet = formatTimesheet(stationInfo.timesheet || []);
    const infoCard = {
      show: true,
      stationName,
      stationPosition: position,
      svgPosition:
        svgX != null && svgY != null ? { x: +svgX, y: +svgY } : null,
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
    e.stopPropagation();
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
          r="6"
          fill="white"
          stroke={station.stroke}
          strokeWidth="2.5"
          id={station.id}
          statid={station.statid}
          key={(station.id || 'station') + i}
          className="station-dot"
          style={{ cursor: 'pointer' }}
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
          className="station-transfer"
          style={{ cursor: 'pointer' }}
        />
      );
    }

    return (
      <g className="stations" onClick={(e) => this.convertShow(e)}>
        {stationEles}
        {transferEles}
      </g>
    );
  }
}

export default Station;
