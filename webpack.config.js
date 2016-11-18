var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var CopyWebPackPlugin = require('copy-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var HtmlWebPackPlugin = require('html-webpack-plugin');

var entry = {};

var examples = fs.readdirSync(path.join(__dirname, "src")).filter(function (file) {
    return (file.slice(-3) == ".ts");
});

//add examples to entry object
for (var i = 0; i < examples.length; i++) {
    var name = examples[i].split('.')[0];
    entry[String(name)] = path.join(__dirname, "src", examples[i]);
}

var awayjsfull = fs.readdirSync(path.join(__dirname, "node_modules", "awayjs-full", "lib")).filter(function (file) {
    return (file.slice(-3) == ".ts");
});

//add awayjs modules to entry object
entry['awayjs-full'] = ['awayjs-full'];

for (var i = 0; i < awayjsfull.length; i++) {
    var name = awayjsfull[i].split('.')[0];
    entry['awayjs-full'].push('awayjs-full/lib/' + name);
}

var plugins = [
    // new webpack.DllReferencePlugin({
    //     context: path.join(__dirname, "src"),
    //     manifest: require("./libs/awayjs-full-manifest.json")
    // }),
    new webpack.optimize.CommonsChunkPlugin({name:'awayjs-full', filename:'js/awayjs-full.bundle.js'}),

    new CopyWebPackPlugin([{
            from: path.join(__dirname, "src", "assets"),
            to: 'assets'
        }])
    
    // new CompressionPlugin({
    //     test: /\.js$/
    // })
];

for (var i = 0; i < examples.length; i++) {
    var name = examples[i].split('.')[0];
    plugins.push(new HtmlWebPackPlugin({
        title: name,
        template: 'html-template/index.html',
        filename: name + '.html',
        inject: false,
        commonChunk: 'awayjs-full'
        // libs: ['libs/awayjs-full.js']
    }));
}

module.exports = {

    entry: entry,
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, "bin"),
        filename: 'js/[name].js'
    },
    resolve: {
        alias: {
            "awayjs-full": path.join(__dirname, "node_modules", "awayjs-full", "dist")
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
            // all files with a `.ts` or `.tsx` extension will be handled by `awesome-typescript-loader`
            { test: /\.ts(x?)$/, loader: require.resolve('awesome-typescript-loader')},

            // all files with a `.js` or `.jsx` extension will be handled by `source-map-loader`
            { test: /\.js(x?)$/, loader: require.resolve('source-map-loader') }
        ]
    },
    plugins: plugins
};