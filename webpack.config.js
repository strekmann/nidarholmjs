import path from "path";

import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ServiceWorkerWebpackPlugin from "serviceworker-webpack-plugin";

module.exports = {
  devServer: {
    overlay: true,
    proxy: {
      "*": "http://localhost:3000",
    },
  },
  devtool: "cheap-module-eval-source-map",
  entry: ["./src/client.js"],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
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
  output: {
    path: path.join(__dirname, "dist", "static"),
    publicPath: "/",
    filename: "javascript.js",
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "src", "static"),
      },
    ]),
    new webpack.ContextReplacementPlugin(
      /moment[\\\/]locale$/,
      /^\.\/(en|nb|nn|zh-cn)$/,
    ),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, "src", "sw.js"),
    }),
  ],
};
