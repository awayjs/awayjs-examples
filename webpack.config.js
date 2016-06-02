var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var CopyWebPackPlugin = require('copy-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var HtmlWebPackPlugin = require('html-webpack-plugin');

var examples = fs.readdirSync('./src').filter(function (file) {
    return (file.slice(-3) == ".ts");
});
var entry = {};

for (var i = 0; i < examples.length; i++) {
    var name = examples[i].split('.')[0];
    entry[String(name)] = './src/' + examples[i];
}

entry['awayjs-full'] = ['awayjs-full'];

var plugins = [
    new webpack.optimize.CommonsChunkPlugin('awayjs-full', 'js/awayjs-full.bundle.js'),

    new CopyWebPackPlugin([{
        from: 'src/assets',
        to: 'assets'
    }]),

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
    }));
}

module.exports = {

    entry: entry,
    devtool: 'source-map',
    output: {
        path: './bin',
        filename: 'js/[name].js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
        fallback: [path.join(__dirname, 'node_modules')]
    },
    resolveLoader: {
        fallback: [path.join(__dirname, 'node_modules')]
    },
    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.ts(x?)$/, loader: require.resolve('awesome-typescript-loader') }
        ]
    },
    plugins: plugins
};