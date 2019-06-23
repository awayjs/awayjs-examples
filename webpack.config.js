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

//add awayjs modules to entry object
entry['awayjs'] = ['@awayjs/core', '@awayjs/stage', '@awayjs/view', '@awayjs/renderer', '@awayjs/graphics', '@awayjs/materials', '@awayjs/scene', '@awayjs/player', '@awayjs/parsers', '@awayjs/swf-viewer'];

var plugins = [
    // new webpack.DllReferencePlugin({
    //     context: path.join(__dirname, "src"),
    //     manifest: require("./libs/awayjs-full-manifest.json")
    // }),
    new webpack.optimize.CommonsChunkPlugin({name:'awayjs', filename:'js/awayjs.bundle.js'}),

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
        template: 'html-template/example.html',
        filename: name + '.html',
        inject: false,
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
    devtool: 'source-map',
    //devtool: 'cheap-module-eval-source-map',//use this option for recompiling libs
    output: {
        path: path.join(__dirname, "bin"),
        filename: 'js/[name].js'
    },
    resolve: {
		alias: {
			//"awayjs-full": path.join(__dirname, "node_modules", "awayjs-full", "dist"),
			//uncomment aliases for recompiling libs
			// "tslib": path.join(__dirname, "node_modules", "tslib", "tslib.es6.js"),
			// "@awayjs/core": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/core", "dist"),
			// "@awayjs/graphics": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/graphics", "dist"),
			// "@awayjs/scene": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/scene", "dist"),
			// "@awayjs/stage": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/stage", "dist"),
			// "@awayjs/renderer": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/renderer", "dist"),
			// "@awayjs/view": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/view", "dist"),
			// "@awayjs/materials": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/materials", "dist"),
			// "@awayjs/player": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/player", "dist"),
			// "@awayjs/parsers": path.join(__dirname, "node_modules", "awayjs-full", "node_modules", "@awayjs/parsers", "dist")
		},
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `awesome-typescript-loader`
            { test: /\.ts(x?)$/, exclude: /node_modules/, loader: require.resolve('awesome-typescript-loader'), query: {useBabel: true, useCache:true}},

            // all files with a `.js` or `.jsx` extension will be handled by `source-map-loader`
            { test: /\.js(x?)$/, loader: require.resolve('source-map-loader') }
        ]
    },
    plugins: plugins
};