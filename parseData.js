var stations = t.station;
var result = {};
stations.forEach(function(ele) {
	var lineArr = ele.lns;
	// 保存每一条线路的时刻表
	var timesheetArr = [];
	lineArr.forEach(function(line) {	
		var timesheet = {};
		timesheet[line.id] = line.fx;
		timesheet[line.id].forEach(function(obj) {
			delete obj.ei;
			delete obj.si;
			delete obj.msg;
		})
		timesheetArr.push(timesheet);
	})
	result[ele.id] = timesheetArr;
})