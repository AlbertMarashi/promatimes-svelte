import { createRenderer } from '../../svelte-router/renderer.js'
import fs, { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import webpack from 'webpack'
import clientConfig from '../webpack/webpack.client.js'
import serverConfig from '../webpack/webpack.server.js'
import koaWebpack from 'koa-webpack'
const __dirname = dirname(fileURLToPath(import.meta.url))
const distdir = resolve(__dirname, '../dist')
let renderer

let clientManifest

export async function update () {
    let serverManifest = JSON.parse(readFileSync(resolve(distdir, './svelte-server-manifest.json'), 'utf-8'))
    return await createRenderer({
        serverManifest,
        clientManifest,
        basedir: distdir,
        template: async (context) => `
<!DOCTYPE html>
<html>
    <head>
        ${ context.state ? `<script>window.__INITIAL_STATE__ = JSON.parse('${JSON.stringify(context.state).replace(/'/g, "\\'")}')</script>` : '' }
        ${ context.head }
        <style>${ context.css.code }</style>
    </head>
    <body>
        <div id="app">${ context.html }</div>
        ${ context.script }
    </body>
</html>`
    })
}

export async function middleware () {
    let { serverCompiler, clientCompiler } = await compile()
    clientManifest = JSON.parse(readFileSync(resolve(distdir, './svelte-client-manifest.json'), 'utf-8'))
    
    let middlewares = []
    if(ENV.environment === 'development') middlewares.push(await hotReloading({serverCompiler, clientCompiler}))

    middlewares.push(async (ctx, next) => {
        ctx.render = renderer.renderToString.bind(renderer)
        await next()
    })

    return middlewares
}

export async function compile () {
    let clientCompiler = webpack(clientConfig)
    let serverCompiler = webpack(serverConfig)

    await Promise.all([
        new Promise((resolve, reject) => {
            clientCompiler.run((err, stats)=>{
                if(stats.toString('errors-warnings')) console.log(stats.toString('errors-warnings'))
                if(err) return reject(err)
                resolve()
            })
        }),
        new Promise((resolve, reject) => {
            serverCompiler.run((err, stats)=>{
                console.log(stats)
                if(stats.toString('errors-warnings')) console.log(stats.toString('errors-warnings'))
                if(err) return reject(err)
                resolve()
            })
        })
    ])

    return {
        clientCompiler,
        serverCompiler
    }
}


async function hotReloading ({serverCompiler, clientCompiler}) {
    var middleware = await koaWebpack({
        compiler: clientCompiler,
        devMiddleware: {
            publicPath: '/dist/',
            noInfo: true,
            logLevel: 'error'
        }
    })

    clientCompiler.hooks.done.tap('done', async (err)=>{
        clientManifest = JSON.parse(middleware.devMiddleware.fileSystem.readFileSync(resolve(distdir, './svelte-client-manifest.json'), 'utf-8'))
        renderer = await update()
    })

    serverCompiler.watch({}, async (err, stats)=>{
        if(err) throw err
        stats = stats.toJson()
        if(stats.errors.length) return
        renderer = await update()
    })

    return middleware
}
