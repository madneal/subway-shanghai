import React from 'react';
import TimesheetTable from './TimesheetTable';
import { lineColor } from '../data/Data';
import { getFirstPair } from '../utils/timesheet';
import '../styles/Timesheet.css';

class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timesheetOfEachLine: null,
      currentLine: null,
    };
  }

  convertLine(e) {
    const match = e.target.innerText.match(/\d+/);
    if (!match) {
      return;
    }
    const line = +match[0];
    const timesheetOfEachLine = this.props.timesheet[line];
    this.setState({
      timesheetOfEachLine,
      currentLine: line,
    });
    this.props.changeLine(line);
  }

  getStyle(currentLine, line) {
    if (line === currentLine) {
      return {
        color: '#fff',
        fontWeight: 700,
        backgroundColor: lineColor[line],
      };
    }
    return {
      backgroundColor: '#eee',
      color: '#777',
      fontWeight: 400,
    };
  }

  render() {
    const timesheet = this.props.timesheet;
    const timesheetEles = [];
    let currentLine = this.props.currentLine;
    if (!currentLine && timesheet) {
      currentLine = Object.keys(timesheet)[0];
    }

    for (const line in timesheet) {
      const div = (
        <div
          className="line-name"
          style={this.getStyle(+currentLine, +line)}
          key={line}
          onClick={(e) => this.convertLine(e)}
        >
          {line + '号线'}
        </div>
      );
      timesheetEles.push(div);
    }

    const lineDiv = (
      <div
        className="line"
        style={{ borderBottom: '2px solid ' + lineColor[currentLine] }}
      >
        {timesheetEles}
      </div>
    );
    return (
      <div
        className="timesheet"
        style={{ display: this.props.timesheetActive ? 'block' : 'none' }}
      >
        {lineDiv}
        <TimesheetTable
          timesheetOfEachLine={
            this.state.timesheetOfEachLine || getFirstPair(this.props.timesheet)
          }
        />
      </div>
    );
  }
}

export default TimeSheet;
