import React from 'react'
import TimesheetTable from './TimesheetTable'

class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timesheetOfEachLine: null,
      currentLine: null
  }
    
  convertLine(e) {
    const line = e.target.attrivutes.key.value;
    const timesheetOfEachLine = this.props.timesheet[line];
    this.setState({
      timesheetOfEachLine: timesheetOfEachLine,
      currentLine: line
    });
  }

  render() {
    const timesheet = this.props.timesheet;
    const timesheetEles = [];
    
    for (const line in timesheet) {
      const div = <div className="line-sheet" key="line">{line} + '号线'<TimesheetDiv timesheet = {this.state.timesheetOfEachLine} /></div>;
      timesheetEles.push(div);
    }

    return (
      <div className="timesheet">
      {timesheetEles onClick={e => this.convertLine(e)} }
      </div>
    )
  }
}

export default TimeSheet
