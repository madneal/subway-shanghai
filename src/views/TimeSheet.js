import React from 'react'
import TimesheetDiv from './TimesheetDiv'

class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timesheetOfEachLine: null
  }

  render() {
    const timesheet = this.props.timesheet;
    const timesheetEles = [];
    
    for (const line in timesheet) {
      const div = <div className="line-sheet">{line}<TimesheetDiv timesheet = {this.state.timesheetOfEachLine} /></div>;
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
