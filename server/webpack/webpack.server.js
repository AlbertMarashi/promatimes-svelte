import merge from 'webpack-merge'
import base from './webpack.base.js'
import nodeExternals from 'webpack-node-externals'
import SvelteWebpackServerPlugin from '../../svelte-router/SvelteWebpackServerPlugin.js'
import sveltePreprocess from 'svelte-preprocess'

export default merge(base, {
    target: 'node',
    entry: '@/server.js',
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.(svelte)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        generate: 'ssr',
                        preprocess: sveltePreprocess({})
                    }
                }            
            }
        ]
    },
    externals: nodeExternals({
        whitelist: /\.css$/
    }),
    plugins: [
        new SvelteWebpackServerPlugin()
    ]
})
