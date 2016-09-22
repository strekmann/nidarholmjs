import webpack from 'webpack';
import path from 'path';

module.exports = {
    entry: './src/client/app.js',
    devtool: 'cheap-module-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                // This has effect on the react lib size
                NODE_ENV: JSON.stringify('development'),
            },
            __CLIENT__: JSON.stringify(true),
        }),
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|nb|nn|zh-cn)$/),
    ],
    output: {
        filename: 'javascript.js',
        publicPath: 'http://localhost:3001/js/',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: 'react-hmre',
                },
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css'],
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'postcss', 'sass?outputStyle=expanded'],
            },
            {
                test: /fontawesome-webfont\.(eot|woff|woff2|ttf|svg)/,
                loader: 'file?name=src/client/fonts/[name].[ext]',
            },
            {
                test: /\.(png|jpg|svg|eot|woff|woff2|ttf)$/,
                loader: 'file',
            },
        ],
    },
    sassLoader: {
        includePaths: [
            path.resolve(__dirname, 'node_modules/bootstrap-sass/assets/stylesheets'),
            path.resolve(__dirname, 'node_modules/font-awesome/scss'),
            path.resolve(__dirname, 'node_modules/foundation-sites/scss'),
        ]
    }
};
