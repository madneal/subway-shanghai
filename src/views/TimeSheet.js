import React from 'react'
import TimesheetTable from './TimesheetTable'
import { lineColor } from '../data/Data'
import '../styles/Timesheet.css'

export default function asyncTimesheet(impotComponent) {
  
  class TimeSheet extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        timesheetOfEachLine: null,
        component: null
      }
    }

    async componentDidMount() {
      const { default: component } = await impotComponent();
      this.setState({
        component: component
      })
    }

    convertLine(e) {
      const line = +e.target.innerText.match(/\d+/)[0];
      const timesheetOfEachLine = this.props.timesheet[line];
      this.setState({
        timesheetOfEachLine: timesheetOfEachLine,
        currentLine: line
      });
      this.props.changeLine(line);
    }

    getStyle(currentLine, line) {
      let style = null;
      if (line === currentLine) {
        style = {
          color: '#fff',
          fontWeight: 700,
          backgroundColor: lineColor[line],
        };
      } else {
        style = {
          backgroundColor: '#eee',
          color: '#777',
          fontWeight: 400,
        }
      }
      return style;
    }

    getFirstPair(object) {
      for (const key in object) {
        return object[key];
      }
    }

    render() {
      const timesheet = this.props.timesheet;
      const timesheetEles = [];
      let currentLine = this.props.currentLine;
      if (!currentLine && timesheet) {
        currentLine = Object.keys(timesheet)[0];
      }

      for (const line in timesheet) {
        const div = <div className="line-name" style={this.getStyle(+currentLine, +line)} key={line}
          onClick={e => this.convertLine(e)}>{line + '号线'}</div>
        timesheetEles.push(div);
      }

      const lineDiv = <div className="line" style={{ borderBottom: '2px solid ' + lineColor[currentLine] }}>{timesheetEles}</div>
      return (
        <div className="timesheet" style={{ display: this.props.timesheetActive ? 'block' : 'none' }}>
          {lineDiv}
          <TimesheetTable timesheetOfEachLine={this.state.timesheetOfEachLine || this.getFirstPair(this.props.timesheet)} />
        </div>
      )
    }
  }
  return TimeSheet;
}
