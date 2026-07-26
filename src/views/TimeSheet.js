import React from 'react';
import TimesheetTable from './TimesheetTable';
import { lineColor, lineNames } from '../data/Data';
import { getFirstPair } from '../utils/timesheet';
import '../styles/Timesheet.css';

function lineLabel(lineKey) {
  if (lineNames && lineNames[lineKey]) return lineNames[lineKey];
  if (/^\d+$/.test(String(lineKey))) return `${lineKey}号线`;
  return String(lineKey);
}

class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timesheetOfEachLine: null,
      currentLine: null,
    };
  }

  convertLine(e) {
    const lineKey = e.currentTarget.getAttribute('data-line');
    if (!lineKey || !this.props.timesheet) return;
    const timesheetOfEachLine = this.props.timesheet[lineKey];
    this.setState({
      timesheetOfEachLine,
      currentLine: lineKey,
    });
    this.props.changeLine(lineKey);
  }

  getStyle(currentLine, line) {
    const color = lineColor[line] || '#666';
    if (String(line) === String(currentLine)) {
      return {
        color: '#fff',
        fontWeight: 700,
        backgroundColor: color,
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
      timesheetEles.push(
        <div
          className="line-name"
          style={this.getStyle(currentLine, line)}
          key={line}
          data-line={line}
          onClick={(e) => this.convertLine(e)}
        >
          {lineLabel(line)}
        </div>
      );
    }

    const borderColor = lineColor[currentLine] || '#8a8a8a';
    const lineDiv = (
      <div className="line" style={{ borderBottom: '2px solid ' + borderColor }}>
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
