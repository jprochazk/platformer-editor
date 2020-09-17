const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            /*{
                test: /\.worker\.js$/,
                use: {
                    loader: "worker-loader",
                    options: {
                        inline: true,
                    },
                },
            },*/
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: ["public"],
        }),
    ],
    resolve: {
        extensions: [".ts", ".js"],
        modules: [path.resolve("./src"), path.resolve("./node_modules")],
    },
    output: {
        filename: "main.bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
};
