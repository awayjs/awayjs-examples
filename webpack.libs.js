var path = require("path");
var webpack = require("webpack");
var fs = require('fs');

var entry = {};

var awayjsfull = fs.readdirSync(path.join(__dirname, "node_modules", "awayjs-full", "lib")).filter(function (file) {
    return (file.slice(-3) == ".ts");
});

//add awayjs modules to entry object
entry['awayjsfull'] = ['awayjs-full'];

for (var i = 0; i < awayjsfull.length; i++) {
    var name = awayjsfull[i].split('.')[0];
    entry['awayjsfull'].push('awayjs-full/lib/' + name);
}

module.exports = {
    entry: entry,
    output: {
        path: path.join(__dirname, "libs"),
        filename: 'awayjs-full.js',
        library: "[name]"
    },
    //turn on sourcemaps
    devtool: 'source-map',
    resolve: {
        alias: {
            "awayjs-full": "awayjs-full/dist",
            //unecessary when combined d.ts files are possible
            "awayjs-core": "awayjs-full/node_modules/awayjs-core/dist",
            "awayjs-display": "awayjs-full/node_modules/awayjs-display/dist",
            "awayjs-stagegl": "awayjs-full/dist/node_modules/awayjs-stagegl/dist",
            "awayjs-renderergl": "awayjs-full/node_modules/awayjs-renderergl/dist",
            "awayjs-methodmaterials": "awayjs-full/node_modules/awayjs-methodmaterials/dist",
            "awayjs-player": "awayjs-full/node_modules/awayjs-player/dist",
            "awayjs-parsers": "awayjs-full/node_modules/awayjs-parsers/dist"
        },
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
        fallback: [path.join(__dirname, 'node_modules')]
    },
    resolveLoader: {
        fallback: [path.join(__dirname, 'node_modules')]
    },
    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by 'awesome-typescript-loader'
            { test: /\.ts(x?)$/, loader: require.resolve('awesome-typescript-loader') },

            { test: /\.js(x?)$/, loader: require.resolve('source-map-loader') }
        ]
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, "libs", "awayjs-full-manifest.json"),
            name: "awayjsfull",
            context: path.resolve(__dirname, "src")
        })
    ]
}