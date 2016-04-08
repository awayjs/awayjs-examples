var path = require("path");
var glob = require("glob");
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    
    entry: {
        Advanced_MultiPassSponzaDemo: './src/Advanced_MultiPassSponzaDemo.ts',
        AircraftDemo: './src/AircraftDemo.ts',
        AWD3ViewerMinimal: './src/AWD3ViewerMinimal.ts',
        AWDSuzanne: './src/AWDSuzanne.ts',
        Basic_Fire: './src/Basic_Fire.ts',
        Basic_Load3DS: './src/Basic_Load3DS.ts',
        Basic_LoadAWD: './src/Basic_LoadAWD.ts',
        Basic_Shading: './src/Basic_Shading.ts',
        Basic_Skybox: './src/Basic_Skybox.ts',
        Basic_View: './src/Basic_View.ts',
        CubePrimitive: './src/CubePrimitive.ts',
        Intermediate_AWDViewer: './src/Intermediate_AWDViewer.ts',
        Intermediate_Globe: './src/Intermediate_Globe.ts',
        Intermediate_MD5Animation: './src/Intermediate_MD5Animation.ts',
        Intermediate_MonsterHeadShading: './src/Intermediate_MonsterHeadShading.ts',
        Intermediate_MouseInteraction: './src/Intermediate_MouseInteraction.ts',
        Intermediate_ParticleExplosions: './src/Intermediate_ParticleExplosions.ts',
        Intermediate_PerelithKnight: './src/Intermediate_PerelithKnight.ts',
        ObjLoaderMasterChief: './src/ObjLoaderMasterChief.ts',
        TorusPrimitive: './src/TorusPrimitive.ts',
        awayjs: [
            'awayjs-core',
            'awayjs-display',
            'awayjs-stagegl',
            'awayjs-renderergl',
            'awayjs-methodmaterials',
            'awayjs-player',
            'awayjs-parsers'
        ]
    },
    devtool: 'source-map',
    output: {
        path: './bin/js',
        filename: '[name].js'
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
            { test: /\.ts(x?)$/, loader: require.resolve('ts-loader') }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('awayjs', 'awayjs.bundle.js')
    ]
};