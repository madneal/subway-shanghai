# :train2::train2::train2: 上海地铁线路图

之前的版本主要是基于原生 js 写的，的确随着代码量的增加，代码显得愈发的混乱，因此新的版本基于 create react app 实现了一次完整的重构。

## 组件结构

将整个地图理解成一个 Map 组件，再将其分为 4 个小组件：

![map.png](http://ozfo4jjxb.bkt.clouddn.com/map.png)

* Label: 地图上的文本信息，包括地铁站名，线路名称
* Station: 地铁站点，包括普通站点和中转站点
* Line： 地铁线路
* InfoCard: 状态最复杂的一个组件，主要包含时刻表信息、卫生间位置信息、出入口信息、无障碍电梯信息

## LICENSE

[MIT](https://github.com/neal1991/subway-shanghai/blob/master/LICENSE.md)




