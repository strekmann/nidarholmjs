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
  entry: ["./src/client.tsx"],
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
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
      /*
      {
        enforce: "pre",
        test: /.js$/, exclude: /node_modules/,
        loader: "source-map-loader",
      },
      */
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
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
};
