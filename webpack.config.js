var path              = require('path');
var webpack           = require('webpack');
var BundleTracker     = require('webpack-bundle-tracker');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var fs                = require('fs');

module.exports = {
    context: __dirname,

    entry:     [
        'react-hot-loader/patch',
        'webpack-dev-server/client?https://localhost:63000',
        'webpack/hot/only-dev-server',
        './assets/js/index'
    ],
    // devtool:   'eval',
    devtool:   'inline-source-map',
    devServer: {
        inline:             true,
        hot:                true,
        compress:           true,
        disableHostCheck:   true,   // That solved fix Invalid Host header
        headers:            {'Access-Control-Allow-Origin': '*'},
        historyApiFallback: true,
        host:               'localhost',
        https:              {
            key:  fs.readFileSync('/usr/local/etc/ssl/billow_dev/billow-localhost.key'),
            cert: fs.readFileSync('/usr/local/etc/ssl/billow_dev/billow-localhost.crt')
            // ca:   fs.readFileSync("/path/to/ca.pem"),
        },
        port:               63000
        // proxy: {
        //     '/static': 'https://localhost:63000/static/'
        // }
    },
    output:    {
        //where you want your compiled bundle to be stored
        path:       path.resolve('./bundles/'),
        publicPath: 'https://localhost:63000/static/bundles/',
        //naming convention webpack should use for your files
        filename:   '[name].js'
        // filename:   '[name]-[hash].js',
    },
    plugins:   [
        // new webpack.HotModuleReplacementPlugin(), // if --hot then error
        //tells webpack where to store data about your bundles.
        new BundleTracker({filename: './webpack-stats.json'}),
        new ExtractTextPlugin('styles.css'),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
                BASE_URL: '"http://localhost:64080"'
            }
        })
    ],
    module:    {
        rules: [
            {
                test:    /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader:  ['babel-loader']
                // query:   {
                //     // presets: ['react', 'env']
                //     // presets: ['env', 'react']
                // }
            },
            {
                test:   /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'file-loader'
            },
            {
                test:    /\.(png|jpg|gif|svg)$/,
                loader:  'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            },
            {
                test: /\.css$/,
                use:  ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use:      'css-loader'
                })
            },
            {
                test:    /\.(scss|sass)$/i,
                include: [
                    path.resolve(__dirname, 'node_modules')
                    // path.resolve(__dirname, 'path/to/imported/file/dir'),
                ],
                loaders: ['css', 'sass']
            }
        ]
    },

    resolve: {
        //extensions that should be used to resolve modules
        extensions: ['.js']
    }
};