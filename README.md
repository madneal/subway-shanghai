# subway-shanghai

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4070ff787b7d4da5a494756242686fd8)](https://www.codacy.com/app/neal1991/subway-shanghai?utm_source=github.com&utm_medium=referral&utm_content=neal1991/subway-shanghai&utm_campaign=badger)


The subway map in Shanghai. It can be utilized in offline environment. You'd better use this in Chome. The web application can be added to homescreen. It will provide you with native expericen. Any suggestions are welcome. @[neal](mailto:bing.ecnu@gmail.com) :smile_cat:

## main features
* The map of the Shanghai subway
* Scale the map with pinch gesture
* The timesheet of each station
* The washroom location infomation of each station

## condfig
Gulp is utilized to build. There are several tasks of gulp.

sass: to generate the corresponding css

generate-sw: As for service worker, if you modify the files cached by service worker, you should run `generate-sw` task by `gulp generate-sw`.


![subway](https://user-images.githubusercontent.com/12164075/29123365-1bf93fca-7d48-11e7-9032-2203222af07d.gif)


