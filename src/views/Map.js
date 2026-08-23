import React from 'react';
import InfoCard from './InfoCard';
import stationInfos from '../data/stationInfo.json';
import { formatTimesheet } from '../utils/timesheet';

const referenceMapUrl = `${import.meta.env.BASE_URL}shanghai-metro-map.svg`;
const stationEntries = Object.entries(stationInfos);

function cardAnchor(event, mapEl) {
  const OFFSET = 14;
  const CARD_W = 360;
  const CARD_H = 280;
  const rect = mapEl?.getBoundingClientRect();
  const hasPointer = event?.clientX > 0 || event?.clientY > 0;
  const point = {
    x: hasPointer && rect ? event.clientX - rect.left + mapEl.scrollLeft : 24,
    y: hasPointer && rect ? event.clientY - rect.top + mapEl.scrollTop : 24,
  };
  const mapW = mapEl?.scrollWidth || point.x + CARD_W;
  const mapH = mapEl?.scrollHeight || point.y + CARD_H;

  let x = point.x + OFFSET;
  let y = point.y + OFFSET;
  if (x + CARD_W > mapW - 8) x = point.x - CARD_W - OFFSET;
  if (y + CARD_H > mapH - 8) y = point.y - CARD_H - OFFSET;

  return { x: Math.max(8, x), y: Math.max(8, y) };
}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infoCard: {
        show: false,
        stationName: '',
        stationPosition: { x: null, y: null },
        statId: null,
        timesheet: null,
      },
      stationInfo: null,
    };
    this.mapRef = React.createRef();
    this.referenceRef = React.createRef();
    this.overlayRef = React.createRef();
    this.accessListRef = React.createRef();
  }

  bindReferenceSvg = () => {
    const svgDocument = this.referenceRef.current?.contentDocument;
    const overlay = this.overlayRef.current;
    const reference = this.referenceRef.current;
    if (!svgDocument?.documentElement || !overlay || !reference) return;

    overlay.replaceChildren();
    const referenceRect = reference.getBoundingClientRect();
    let boundStations = 0;

    for (const [statId, info] of stationEntries) {
      if (!info.station_code) continue;
      const marker = svgDocument.getElementById(`ST${info.station_code}`);
      if (!marker) continue;
      const markerRect = marker.getBoundingClientRect();
      if (!markerRect.width && !markerRect.height) continue;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reference-station-hit';
      button.dataset.statid = statId;
      button.dataset.stationName = info.name_cn;
      button.setAttribute('aria-label', info.name_cn);
      button.title = info.name_cn;
      button.style.left = `${
        ((markerRect.x + markerRect.width / 2) / referenceRect.width) * 100
      }%`;
      button.style.top = `${
        ((markerRect.y + markerRect.height / 2) / referenceRect.height) * 100
      }%`;
      overlay.appendChild(button);
      boundStations += 1;
    }

    overlay.dataset.boundStations = String(boundStations);
    for (const button of this.accessListRef.current?.querySelectorAll(
      '[data-station-code]:not([data-station-code=""])'
    ) || []) {
      button.hidden = true;
    }
  };

  handleOverlayClick = (event) => {
    const station = event.target.closest?.('[data-statid]');
    if (!station) {
      this.hideInfoCard();
      return;
    }
    this.openStation(station.dataset.statid, station.dataset.stationName, event);
    event.stopPropagation();
  };

  openStation = (statId, stationName, event) => {
    const stationInfo = stationInfos[statId];
    if (!stationInfo) return;
    const timesheet = formatTimesheet(stationInfo.timesheet || []);
    this.setState({
      infoCard: {
        show: true,
        stationName: stationName || stationInfo.name_cn,
        stationPosition: cardAnchor(event, this.mapRef.current),
        statId,
        timesheet,
        currentLine: Object.keys(timesheet)[0],
      },
      stationInfo,
    });
  };

  hideInfoCard = () => {
    if (!this.state.infoCard.show) return;
    this.setState({ infoCard: { ...this.state.infoCard, show: false } });
  };

  changeInfoCard(infoCard) {
    this.setState({ infoCard });
  }

  render() {
    return (
      <div
        className="map"
        ref={this.mapRef}
        onClick={(event) => {
          if (event.target === event.currentTarget) this.hideInfoCard();
        }}
      >
        <div className="reference-map-shell">
          <object
            ref={this.referenceRef}
            className="reference-map"
            data={referenceMapUrl}
            type="image/svg+xml"
            aria-label="上海轨道交通线路图"
            onLoad={this.bindReferenceSvg}
          >
            <p>无法加载上海轨道交通线路图。</p>
          </object>
          <div
            ref={this.overlayRef}
            className="reference-station-overlay"
            onClick={this.handleOverlayClick}
            aria-label="可交互地铁站点"
          />
        </div>

        <nav
          ref={this.accessListRef}
          className="station-access-list"
          aria-label="地铁站点"
        >
          {stationEntries.map(([statId, info]) => (
            <button
              type="button"
              key={statId}
              data-station-code={info.station_code || ''}
              onClick={(event) => this.openStation(statId, info.name_cn, event)}
            >
              {info.name_cn}
            </button>
          ))}
        </nav>

        <InfoCard
          infoCard={this.state.infoCard}
          stationInfo={this.state.stationInfo}
          closeInfoCard={this.hideInfoCard}
          changeInfoCard={(infoCard) => this.changeInfoCard(infoCard)}
        />
      </div>
    );
  }
}

export default Map;
