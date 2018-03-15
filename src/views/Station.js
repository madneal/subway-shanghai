import React from 'react'
import stations from '../data/stations.json'
import transfers from '../data/transfers.json'
import transferPath from '../imgs/transfer.png'

export default function asyncStation(importComponent) {
  class Station extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        infoCard: null,
        component: null
      }
    }

    async componentDidMount() {
      const { default: component } = await importComponent();
      this.setState({
        component: component
      })
    }

    getAttVal(attributes, attrName) {
      if (attributes[attrName]) {
        if (attrName === 'cx' || attrName === 'cy') {
          return attributes[attrName];
        } else {
          return attributes[attrName].value;
        }
      } else {
        return null;
      }
    }

    formatTimesheet(timesheet) {
      let formatedTimesheet = {};
      for (const key in timesheet) {
        const ele = timesheet[key];
        const line = ele.line;
        const data = {
          firstTime: ele.first_time,
          lastTime: ele.last_time,
          weekday: ele.last_time_desc ? JSON.parse(ele.last_time_desc).weekday : null,
          description: ele.description
        };
        if (!formatedTimesheet[line]) {
          formatedTimesheet[line] = [data];
        } else {
          formatedTimesheet[line] = formatedTimesheet[line].concat(data);
        }
      }
      return formatedTimesheet;
    }

    convertShow(e) {
      const stationInfos = require('../data/stationInfo.json');
      const attributes = e.target.attributes;
      const stationName = this.getAttVal(attributes, 'id') || this.getAttVal(attributes, 'dataid');
      const x = e.target.x ? e.target.x.baseVal.valueAsString : e.target.cx.baseVal.valueAsString;
      const y = e.target.y ? e.target.y.baseVal.valueAsString : e.target.cy.baseVal.valueAsString;
      const position = {
        x: +x + 100,
        y: +y + 70
      };
      const statId = this.getAttVal(attributes, 'statid');
      let timesheet = null;
      timesheet = stationInfos[statId].timesheet;
      timesheet = this.formatTimesheet(timesheet);
      const infoCard = {
        show: !this.state.show,
        stationName: stationName,
        stationPosition: position,
        statId: statId,
        timesheet: timesheet
      }
      const stationInfo = stationInfos[statId];
      this.props.convertShowInfoCard(infoCard, stationInfo);
    }

    render() {
      const stationEles = [];
      const transferEles = [];

      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        stationEles.push(
          <circle cx={station.cx} cy={station.cy} r="5" fill="white" stroke={station.stroke} id={station.id} statid={station.statid} key={station.id + i}></circle>
        )
      }

      for (let i = 0; i < transfers.length; i++) {
        const transfer = transfers[i];
        transferEles.push(
          <image x={transfer.x} y={transfer.y} dataid={transfer['data-id']} href={transferPath} statid={transfer.statid} key={transfer['data-id'] + i}></image>
        )
      }

      return (
        <g onClick={e => this.convertShow(e)}>
          {stationEles}
          {transferEles}
        </g>
      )
    }
  }
  return Station;
}
