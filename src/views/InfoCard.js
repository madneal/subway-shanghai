import React from 'react'
import '../styles/InfoCard.css'
import closeIcon from '../imgs/close.png'
import wcActive from '../imgs/wc.png'
import wcInactive from '../imgs/wc0.png'
import elevatorActive from '../imgs/elevator.png'
import elevatorInactive from '../imgs/elevator0.png'
import entranceActive from '../imgs/exit.png'
import entranceInactive from '../imgs/exit0.png'
import asyncTimesheet from './TimeSheet'
const TimeSheet = asyncTimesheet(() => import('./TimeSheet'))

export default function asyncInfoCard(importComponent) {
  class InfoCard extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        toiletPosition: false,
        elevator: false,
        entranceInfo: false,
        info: null,
        lastClickId: null,
        line: null,
        timesheetActive: true,
        component: null
      }
    }

    async componentDidMount() {
      const { default: component } = await importComponent();
      this.setState({
        component: component
      })
    }

    getStyle(infoCard) {
      return {
        display: infoCard.show ? 'block' : 'none',
        left: +infoCard.stationPosition.x - 130 + 'px',
        top: +infoCard.stationPosition.y - 20 + 'px'
      }
    }

    getContainerStyle(line, timesheetActive) {
      return {
        borderTop: '2px solid #8a8a8a',
        display: timesheetActive ? 'none' : 'block'
      }
    }

    changeIconState(id, state) {
      if (state.lastClickId === null) {
        state[id] = true;
      } else {
        if (id === state.lastClickId) {
          state[id] = !state[id];
        } else {
          state.toiletPosition = false;
          state.elevator = false;
          state.entranceInfo = false;
          state[id] = true;
        }
      }
      return state;
    }

    fotmatStationInfo(stationInfo) {
      stationInfo = stationInfo.replace(/\d+号线/g, word => {
        return '<b>' + word + '</b>'
      });
      stationInfo = stationInfo.replace('<br />', '');
      stationInfo = stationInfo.replace(/,/g, ',<br />');
      return stationInfo;
    }

    changeState(e) {
      const id = e.target.attributes['id'] ? e.target.attributes['id'].value : null;
      const stationInfo = this.props.stationInfo;
      const state = this.changeIconState(id, this.state);
      state.lastClickId = id;
      state.line = stationInfo.timesheet[0].line;
      state.timesheetActive = !(state.toiletPosition || state.elevator || state.entranceInfo);
      state.info = this.fotmatStationInfo(this.props.stationInfo[id]);
      this.setState(state);
      e.stopPropagation();
    }

    isIconActivated() {
      return this.state.toiletPosition || this.state.elevator || this.state.entranceInfo;
    }

    getInfo() {
      const ids = ['toiletPosition', 'elevator', 'entranceInfo'];
      let infoHtml = null;
      ids.forEach(id => {
        if (this.state[id]) {
          infoHtml = this.fotmatStationInfo(this.props.stationInfo[id]);
        }
      })
      return infoHtml;
    }

    changeLine(line) {
      const infoCard = this.props.infoCard;
      infoCard.currentLine = line;
      this.props.changeInfoCard(infoCard);
    }

    render() {
      const infoCard = this.props.infoCard;

      return (
        <div className="info-card" style={this.getStyle(this.props.infoCard)}>
          <img src={closeIcon} className="close" alt="关闭" title="关闭" onClick={(e) => this.props.closeInfoCard(e)} />
          <div className="header">
            {infoCard.stationName}
            <span className="icons" onClick={e => this.changeState(e)}>
              <img src={this.state.toiletPosition ? wcActive : wcInactive} alt="卫生间" title="卫生间" id="toiletPosition" />
              <img src={this.state.elevator ? elevatorActive : elevatorInactive} alt="无障碍电梯" title="无障碍电梯" id="elevator" />
              <img src={this.state.entranceInfo ? entranceActive : entranceInactive} alt="出入口" title="出入口" id="entranceInfo" />
            </span>
          </div>
          <div className="container">
            <TimeSheet timesheet={this.props.infoCard.timesheet} timesheetActive={this.state.timesheetActive} currentLine={this.props.infoCard.currentLine} changeLine={(line)=>{this.changeLine(line)}}/>
            <div className="info-container" style={this.getContainerStyle(this.state.line, this.state.timesheetActive)} dangerouslySetInnerHTML={{__html: this.getInfo()}}></div>
          </div>
        </div>
      )
    }
  }
  return InfoCard;

}

