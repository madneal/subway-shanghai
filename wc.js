const fs = require('fs');

const trim = str => {
	return str.replace(/^\s+|\s+$/gm, '');
}

fs.readFile('wc.txt', 'utf-8', (err, data) => {
	const arr = data.split('\n');
	const stationInfo = {};
	const reg = /alt="[\u4e00-\u9fa5]+/;
	for (let i = 0; i < arr.length; i++) {
		const lineData = arr[i];
		stationName = lineData.match(reg)[0];
		stationName = stationName.replace(/alt="/, '');
		const info = lineData.replace(reg, '');
		info = info.replace(/\r/, '');
		info = trim(info);
		stationInfo[stationName] = info;
	}
	const jsonStr = JSON.stringify(stationInfo);
	fs.writeFileSync('wc.json', jsonStr, 'utf8', function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('the json has been created successfully!');
		}
	})
	console.log('finished');
})
