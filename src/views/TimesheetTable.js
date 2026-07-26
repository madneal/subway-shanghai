import React from 'react';
import { timeExtend } from '../utils/timesheet';
import '../styles/TimesheetTable.css';

class TimesheetTable extends React.Component {
  render() {
    const timesheetOfEachLine = this.props.timesheetOfEachLine;
    const timesheetTableDiv = [];
    if (timesheetOfEachLine) {
      for (const index in timesheetOfEachLine) {
        const ele = timesheetOfEachLine[index];
        const direction = ele.description;
        const firstTime = ele.firstTime;
        const lastTime = ele.lastTime;
        const lastTimeExtend = timeExtend(ele.weekday, lastTime);
        const style = lastTime === lastTimeExtend ? null : { color: 'red' };

        timesheetTableDiv.push(
          <tr key={direction + index}>
            <td>{direction}</td>
            <td>
              {firstTime + '/'}
              {lastTime}
            </td>
            <td>
              {firstTime + '/'}
              <span style={style}>{lastTimeExtend}</span>
            </td>
          </tr>
        );
      }
    }
    return (
      <table>
        <thead>
          <tr>
            <th>方向</th>
            <th>周日-周四</th>
            <th>周五-周六</th>
          </tr>
        </thead>
        <tbody>{timesheetTableDiv}</tbody>
      </table>
    );
  }
}

export default TimesheetTable;
