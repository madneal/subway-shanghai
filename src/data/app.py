import json

with open ('./stationInfo.json', mode='r', encoding='utf8') as f:
  stations = json.load(f)
result = {}
for key in stations:
  stationInfo = stations[key]
  timesheets = stationInfo['timesheet']
  timesheets1 = []
  for index, timesheet in enumerate(timesheets):
    last_time_desc = timesheet['last_time_desc']
    print(last_time_desc)
    if last_time_desc != "" and last_time_desc is not None:
      last_time_desc = json.loads(last_time_desc, encoding='utf8')
      del last_time_desc['dateday']
    timesheet['last_time_desc'] = last_time_desc

with open('./stationInfo1.json', mode='w', encoding='utf8') as f:
  str = json.dumps(stations, ensure_ascii=False)
  f.write(str)
  f.close()