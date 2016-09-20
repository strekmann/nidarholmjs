import webpack from 'webpack';

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
        ],
    },
};
