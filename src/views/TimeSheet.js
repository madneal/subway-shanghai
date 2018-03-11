import React from 'react'

class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    return (
      <div className="timesheet">
        <div className="line-name">{props.stationName}</div>
      </div>
    )
  }
}