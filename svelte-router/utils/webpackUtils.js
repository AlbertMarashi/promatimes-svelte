import * as chalk from 'chalk'
const { red, yellow } = chalk
const prefix = '[svelte-server-renderer-webpack-plugin]'
export const warn = msg => console.error(red(`${prefix} ${msg}\n`))
export const tip = msg => console.log(yellow(`${prefix} ${msg}\n`))

export const validate = compiler => {
    if (compiler.options.target !== 'node') {
        warn('webpack config `target` should be "node".')
    }

    if (compiler.options.output && compiler.options.output.libraryTarget !== 'commonjs2') {
        warn('webpack config `output.libraryTarget` should be "commonjs2".')
    }

    if (!compiler.options.externals) {
        tip(
            'It is recommended to externalize dependencies in the server build for '
      + 'better build performance.'
        )
    }
}

export const onEmit = (compiler, name, hook) => {
    if (compiler.hooks) {
    // Webpack >= 4.0.0
        compiler.hooks.emit.tapAsync(name, hook)
    } else {
    // Webpack < 4.0.0
        compiler.plugin('emit', hook)
    }
}

export { isJS, isCSS } from './utils.js'
