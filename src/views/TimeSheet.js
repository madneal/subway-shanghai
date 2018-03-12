import React from 'react'

class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const timesheet = this.props.timesheet;

    return (
      <div className="timesheet">
        <div className="line-name"></div>
      </div>
    )
  }
}

export default TimeSheet