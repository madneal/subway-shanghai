/**
 * Pure timesheet helpers — kept separate so unit tests don't need React.
 */

export function formatNum(num) {
  if (num < 10) {
    return `0${num}`;
  }
  return `${num}`;
}

/**
 * Add minutes to an HH:mm time string. Hours wrap past midnight with a "次日" prefix.
 */
export function addTime(currentTime, minutes) {
  const timeArr = currentTime.split(':');
  let hour = +timeArr[0];
  let minute = +timeArr[1];
  minute = minute + minutes;
  if (minute >= 60) {
    hour = hour + Math.floor(minute / 60);
    minute = minute % 60;
  }
  if (hour > 23) {
    hour = hour - 24;
    return `次日${formatNum(hour)}:${formatNum(minute)}`;
  }
  return `${formatNum(hour)}:${formatNum(minute)}`;
}

/**
 * Extend last train time using weekend adjustment minutes from weekday array.
 */
export function timeExtend(weekday, lastTime) {
  if (weekday && weekday[weekday.length - 1] !== 0) {
    return addTime(lastTime, +weekday[weekday.length - 1]);
  }
  return lastTime;
}

/**
 * Group raw API-style timesheet rows by line number.
 */
export function formatTimesheet(timesheet) {
  const formatedTimesheet = {};
  for (const key in timesheet) {
    const ele = timesheet[key];
    const line = ele.line;
    let weekday = null;
    if (ele.last_time_desc) {
      try {
        weekday = JSON.parse(ele.last_time_desc).weekday;
      } catch {
        weekday = null;
      }
    }
    const data = {
      firstTime: ele.first_time,
      lastTime: ele.last_time,
      weekday,
      description: ele.description,
    };
    if (!formatedTimesheet[line]) {
      formatedTimesheet[line] = [data];
    } else {
      formatedTimesheet[line] = formatedTimesheet[line].concat(data);
    }
  }
  return formatedTimesheet;
}

export function getFirstPair(object) {
  if (!object) {
    return null;
  }
  for (const key in object) {
    return object[key];
  }
  return null;
}
