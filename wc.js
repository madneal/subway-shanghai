var fs = require('fs');

fs.readFile('wc.txt', 'utf-8', function(err, data) {
	var arr = data.split('\n');
	var stationInfo = {};
	var reg = /alt="[\u4e00-\u9fa5]+/;
	for (var i = 0; i < arr.length; i++) {
		var lineData = arr[i];
		stationName = lineData.match(reg)[0];
		stationName = stationName.replace(/alt="/, '');
		var info = lineData.replace(reg, '');
		info = info.replace(/\r/, '');
		info = trim(info);
		stationInfo[stationName] = info;
	}
	var jsonStr = JSON.stringify(stationInfo);
	fs.writeFileSync('wc.json', jsonStr, 'utf8', function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('the json has been created successfully!');
		}
	})
	console.log('finished');
})

function trim(str) {
	return str.replace(/^\s+|\s+$/gm, '');
}