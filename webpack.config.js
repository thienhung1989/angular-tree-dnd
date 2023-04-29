const path = require("path");
const isProduction = process.env.NODE_ENV == "production";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const stylesHandler = "style-loader";
console.log()
const config = {
    entry: {
        'ng-tree-dnd': [
            './src/main.js',
            './src/module/angular-tree-dnd-template.js',

            // Controller
            './src/controller/angular-tree-dnd-node.js',
            './src/controller/angular-tree-dnd-node-handle.js',
            './src/controller/angular-tree-dnd-nodes.js',

            // Factory
            './src/factory/angular-tree-dnd-helper.js',
            './src/factory/angular-tree-dnd-convert.js',
            './src/factory/angular-tree-dnd-plugin.js',
            './src/factory/angular-tree-dnd-template.js',
            './src/factory/angular-tree-dnd-viewport.js',

            // Filter
            './src/filter/angular-tree-dnd-filter.js',
            './src/filter/angular-tree-dnd-order-by.js',


            // Directive
            './src/directive/angular-tree-dnd-compile.js',
            './src/directive/angular-tree-dnd-node.js',
            './src/directive/angular-tree-dnd-node-handle.js',
            './src/directive/angular-tree-dnd-nodes.js',
            './src/directive/angular-tree-dnd.js',

            // Plugin
            './src/plugin/angular-tree-dnd-tree-control.js',
            './src/plugin/angular-tree-dnd-drag.js',

            // Css
            './src/ng-tree-dnd.scss',
        ],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        open: true,
        host: "localhost",
    },
    plugins: [

        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", {
                    loader: "sass-loader",
                    options: {
                        sourceMap: true,
                        sassOptions: {
                            webpackImporter: false,
                            outputStyle: "compressed",
                        },
                    },
                }]
            },
            /*
            {
                test: /\.css$/i,
                use: [stylesHandler, "css-loader", "postcss-loader"],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: "asset",
            },
            */
            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = "production";
    } else {
        config.mode = "development";
    }
    return config;
};
