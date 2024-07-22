const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumBaseUrl = "cesiumStatic";

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    context: __dirname,
    entry: {
      app: "./src/index.js",
    },
    output: {
      filename: "app.js",
      path: path.resolve(__dirname, "dist"),
      sourcePrefix: "",
      publicPath: '/', // Ensure public path is set to root
    },
    resolve: {
      mainFiles: ["index", "Cesium"],
      extensions: [".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
          type: "asset/inline",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "src/index.html",
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(cesiumSource, "Workers"), to: `${cesiumBaseUrl}/Workers` },
          { from: path.join(cesiumSource, "ThirdParty"), to: `${cesiumBaseUrl}/ThirdParty` },
          { from: path.join(cesiumSource, "Assets"), to: `${cesiumBaseUrl}/Assets` },
          { from: path.join(cesiumSource, "Widgets"), to: `${cesiumBaseUrl}/Widgets` },
          { from: path.resolve(__dirname, "public/models"), to: "models" }, 
        ],
      }),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
      }),
    ],
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval",
    devServer: {
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 9000,
    },
  };
};
