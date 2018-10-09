# :train2::train2::train2: Subway Shanghai

The before vesion is based on native js. With the increse of the size of the code, the code become messy. Therefore, the new version is implemented on the basis of [create-react-app](https://github.com/facebook/create-react-app).

## Component structure

The whole map can be seen as a Map component, and deivde it into 4 child components:

![map](https://camo.githubusercontent.com/5491a1b2fcde37cc7dc78ca4890b16316ae5d87d/687474703a2f2f6f7a666f346a6a78622e626b742e636c6f7564646e2e636f6d2f6d61702e706e67)

* Label: The text infomation of the map, including station name and line name
* Station: Station, including normal station and transfer station
* Line: Subway line
* InfoCard: The most complex component, including timesheet, washroom position information, entrance infomation and elevator information

![subway-react](https://user-images.githubusercontent.com/12164075/37656324-ace5c2b2-2c82-11e8-8b6a-b3c96e091c73.gif)

# Run

`npm start`: Run the app in development mode.

`npm decploy`: Deploy the build results to gh-pages branch, to display the app.

## LICENSE
[MIT](https://github.com/neal1991/subway-shanghai/blob/master/LICENSE.md)
