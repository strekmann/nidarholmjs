const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ServiceWorkerWebpackPlugin = require("serviceworker-webpack-plugin");

const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  entry: "./src/client.js",
  output: {
    path: path.join(__dirname, "dist", "static"),
    filename: "javascript.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: [
                require("autoprefixer")({
                  browsers: ["> 1%", "last 2 versions"],
                }),
              ],
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpg|svg|eot|woff|woff2|ttf)$/,
        loader: "file-loader",
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      },
    }),
    new webpack.ContextReplacementPlugin(
      /moment[\\\/]locale$/,
      /^\.\/(en|nb|nn|zh-cn)$/,
    ),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css",
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, "src", "sw.js"),
    }),
    new CopyWebpackPlugin(
      [
        {
          from: path.join(__dirname, "src", "static"),
        },
      ],
      {
        ignore: ["*.scss"],
      },
    ),
  ],
};
