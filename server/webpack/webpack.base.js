import '../utils/env.js' //global env
import webpack from 'webpack'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
    mode: ENV.environment,
    output: {
        path: resolve(__dirname, '../dist'),
        publicPath: '/dist/',
        filename: '[name].[hash].js'
    },
    resolve: {
        mainFields: ['svelte', 'browser', 'module', 'main'],
        extensions: ['.js', '.svelte', '.json', '.mjs'],
        alias: {
            svelte: resolve('node_modules', 'svelte'),
            '@': resolve(__dirname, '../../app/'),
            'icons': resolve(__dirname, '../../node_modules/')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: ['@babel/plugin-syntax-dynamic-import']
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                loader: 'file-loader'
            },
            {
                test: /\.styl(us)?$/,
                use: [
                    'css-loader',
                    'stylus-loader'
                ]
            },
            {
                test: /\.(jpg|png|gif|svg)$/,
                loader: 'image-webpack-loader',
                // Specify enforce: 'pre' to apply the loader
                // before url-loader/svg-url-loader
                // and not duplicate it in rules with them
                enforce: 'pre'
            }
        ]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    optimization: {
        minimize: ENV.environment === 'production'
    },
    stats: 'errors-warnings'
}
