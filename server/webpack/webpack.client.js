import merge from 'webpack-merge'
import base from './webpack.base.js'
import SvelteWebpackClientPlugin from '../../svelte-router/SvelteWebpackClientPlugin.js'
import sveltePreprocess from 'svelte-preprocess'
import webpack from 'webpack'

export default merge(base, {
    entry: ['@/client.js'],
    optimization: {
        splitChunks: {
            name: 'manifest',
            minChunks: Infinity
        }
    },
    module: {
        rules: [
            {
                test: /\.(svelte)$/,
                use: {
                    loader: 'svelte-loader-hot',
                    options: {
                        dev: true,
                        hydratable: true,
                        hotReload: true,
                        hotOptions: {
                            // optimistic will try to recover from runtime errors during
                            // component init (instead of doing a full reload)
                            optimistic: true
                        },
                        preprocess: sveltePreprocess({})
                    }
                }            
            }
        ]
    },
    plugins: [
        new SvelteWebpackClientPlugin()
    ]
})
