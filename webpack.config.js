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

var optimization = {
    splitChunks: {
        chunks: 'all',
        cacheGroups: {
            vendors: false,
            default: false,
            awayjs: {
                name: 'awayjs',
                filename: 'js/awayjs.bundle.js',
                chunks: 'all',
                test: /[\\/]@awayjs[\\/]/,
            },
            awayfl: {
                name: 'awayfl',
                filename: 'js/awayfl.bundle.js',
                chunks: 'all',
                test: /[\\/]@awayfl[\\/]/,
            }
        }
    }
}

//add examples to entry object
for (var i = 0; i < examples.length; i++) {
    var name = examples[i].split('.')[0];
    entry[String(name)] = path.join(__dirname, "src", examples[i]);
}

//add awayjs modules to entry object

var plugins = [
    // new webpack.DllReferencePlugin({
    //     context: path.join(__dirname, "src"),
    //     manifest: require("./libs/awayjs-full-manifest.json")
    // }),

    new CopyWebPackPlugin([{
            from: path.join(__dirname, "src", "assets"),
            to: 'assets'
        }])
    
    // new CompressionPlugin({
    //     test: /\.js$/
    // })
];

// Generate individual html files for each example.
for (var i = 0; i < examples.length; i++) {
    var name = examples[i].split('.')[0];
    plugins.push(new HtmlWebPackPlugin({
        title: name,
        chunks:[name],
        template: 'html-template/example.html',
        filename: name + '.html',
        commonChunk: 'awayjs'
        // libs: ['libs/awayjs-full.js']
    }));
}

// Generate a listing html that links to all examples.
plugins.push(new HtmlWebPackPlugin({
    title: 'awayjs-examples',
    template: 'html-template/index.html',
    filename: 'index.html',
    examples: examples,
    baseHref: process.env.baseHref || '',
    inject: false
}));

module.exports = {

    entry: entry,
    optimization: optimization,

    node: {
        global: false,
        Buffer: false,
    },
    mode: 'development',
    devtool: 'source-map',
    //devtool: 'cheap-module-eval-source-map',//use this option for recompiling libs
    output: {
        path: path.join(__dirname, "bin"),
        filename: 'js/[name].js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.ts(x?)$/, exclude: /node_modules/, loader: require.resolve('ts-loader')},

            // all files with a `.js` or `.jsx` extension will be handled by `source-map-loader`
            { test: /\.js(x?)$/, loader: require.resolve('source-map-loader') }
        ]
    },
    plugins: plugins
};