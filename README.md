# cesium-webpack-example

A minimal recommended setup for an applications using [Cesium](https://cesium.com) with [Webpack 5](https://webpack.js.org/concepts/).

## Running this application

```sh
npm install
npm start
# for the built version
npm run build
npm run start:built
```

Navigate to `localhost:8080`.

### Available scripts

- `npm start` - Runs a webpack build with `webpack.config.js` and starts a development server at `localhost:8080`
- `npm run build` - Runs a webpack build with `webpack.config.js`
- `npm run start:built` - Start a small static server using `http-server` to demonstrate hosting the built version

## Requiring Cesium in your application


