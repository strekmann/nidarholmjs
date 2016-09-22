var gulp = require("gulp");
var shell = require("gulp-shell");
var sass = require("gulp-sass");
var webpack = require("webpack-stream");
var assign = require("lodash").assign;

var devConfig = {
    devtool: "cheap-module-source-map",
    context: __dirname + "/src",
    plugins: [
        new webpack.webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("development")
            },
            "__CLIENT__": JSON.stringify(true)
        }),
    ],
    output: {
        filename: "javascript.js",
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ["babel-loader"],
            }
        ],
    }
};

var prodConfig = {
    devtool: "cheap-module-source-map",
    context: __dirname + "/src",
    plugins: [
        new webpack.webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            },
            "__CLIENT__": JSON.stringify(true)
        }),
        new webpack.webpack.optimize.DedupePlugin(),
        new webpack.webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.webpack.optimize.UglifyJsPlugin()
    ],
    output: {
        filename: "javascript.js",
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ["babel-loader"],
            }
        ],
    }
};

gulp.task("default", ["build-dev"]);
gulp.task("build", ["sass", "icons", "images", "fonts", "about", "webpack:build"]);
gulp.task("build-dev", ["sass", "icons", "images", "fonts", "about"], function () {
    gulp.watch("src/client/scss/*.scss", ["sass"]);
    gulp.watch("src/client/img/*.*", ["images"]);
    gulp.watch("src/client/*.*", ["about"]);
});

gulp.task("schema", function () {
    return gulp.src("src/server/api/schema.js")
    .pipe(shell("npm run build:schema"))
    .pipe(gulp.dest("src/server/api"));
});

gulp.task("sass", function () {
    return gulp.src("src/client/scss/styles.scss")
    .pipe(sass({ includePaths: [
        "node_modules/bootstrap-sass/assets/stylesheets",
        "node_modules/font-awesome/scss",
        "node_modules/foundation-sites/scss"
    ] }))
    .pipe(gulp.dest("dist/public/css"));
});

gulp.task("webpack:build-dev", ["schema"], function () {
    return gulp.src("src/client/app.js")
    .pipe(webpack(devConfig))
    .pipe(gulp.dest("dist/public/js"));
});

gulp.task("webpack:build", ["schema"], function (callback) {
    return gulp.src("src/client/app.js")
    .pipe(webpack(prodConfig))
    .pipe(gulp.dest("dist/public/js"));
});

gulp.task("icons", function () {
    return gulp.src("node_modules/font-awesome/fonts/*.*")
    .pipe(gulp.dest("dist/public/fonts"));
});

gulp.task("images", function () {
    return gulp.src("src/client/img/*.*")
    .pipe(gulp.dest("dist/public/img"));
});

gulp.task("fonts", function () {
    return gulp.src("src/client/fonts/**/*.*")
    .pipe(gulp.dest("dist/public/fonts/"));
});

gulp.task("about", function () {
    return gulp.src("./src/client/*.txt")
    .pipe(gulp.dest("./dist/public"));
});