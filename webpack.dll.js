var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: {
        awayjsfull: ["awayjs-full"]
    },
    output: {
        path: './src',
        filename: 'awayjs-full.dll.js',
        library: "awayjsfull"
    },
    //turn on sourcemaps
    devtool: 'source-map',
    resolve: {
        root: path.resolve(__dirname, "src"),
        modulesDirectories: ["node_modules"],
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
            path: path.join(__dirname, "src", "awayjs-full-manifest.json"),
            name: "awayjsfull",
            context: path.resolve(__dirname, "src")
        })
    ]
}