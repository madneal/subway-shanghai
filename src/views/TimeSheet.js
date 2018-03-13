import React from 'react'
import TimesheetTable from './TimesheetTabel'
import { lineColor } from '../data/Data'

class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timesheetOfEachLine: null,
      currentLine: null
    }
  }

  convertLine(e) {
    const line = e.target.attrivutes.key.value;
    const timesheetOfEachLine = this.props.timesheet[line];
    this.setState({
      timesheetOfEachLine: timesheetOfEachLine,
      currentLine: line
    });
  }

  getStyle(line) {
    let style = null;
    if (line === this.currentLine) {
      style = {
        background: '#eee',
        color: '#777',
        fontWeight: 400
      };
    } else {
      style = {
        color: '#fff',
        fontWeight: 700,
        background: lineColor[line]
      }
    }
    return style;
  }



  render() {
    const timesheet = this.props.timesheet;
    const timesheetEles = [];

    for (const line in timesheet) {
      const div = <div className="line" key={line} style={this.getStyle(line)} onClick={e => this.convertLine(e)} >{line} + '号线'<TimesheetTable timesheet={this.state.timesheetOfEachLine} /></div>;
      timesheetEles.push(div);
    }

    return (
      <div className="timesheet">
        {timesheetEles}
      </div>
    )
  }
}

export default TimeSheet
