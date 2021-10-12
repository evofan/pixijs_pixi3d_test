const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Pixi.js Demo"
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/assets", to: "assets"
        }
      ]
    })
  ],
  output: {
    filename: "main.js",
    // path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ]
  },
  performance: { hints: false }
  // performance: {
  //  maxEntrypointSize: 1000000,
  //  maxAssetSize: 1000000,
  // },
};
