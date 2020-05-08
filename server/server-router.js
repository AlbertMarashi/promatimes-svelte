import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import koaCookie from 'koa-cookie'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import mount from 'koa-mount'
import koastatic from 'koa-static'
import compress from 'koa-compress'
//import { graphMiddleware } from '../models/graph.js'
//import sessionToken from './middleware/sessionToken.js'
//import { downloadFile, uploadFile } from '../models/cmsFiles.js'

import {
    errorMiddleware,
    noWWW,
    renderer,
    stateContext
} from './middleware/index.js'

const router = new Router()
const __dirname = dirname(fileURLToPath(
    import.meta.url))
const distDir = resolve(__dirname, './dist')
const staticDir = resolve(__dirname, '../app/public')

export default async() => router
    .use(compress())
    .use(stateContext)
    .use(errorMiddleware)
    .use(noWWW)
    .use(koaCookie.default())
    .use(bodyParser())
    //.use(sessionToken)
    .use(koastatic(staticDir))
    .use(mount('/dist', koastatic(distDir, { maxage: 1000 * 60 * 60 * 1 })))
    .use(await renderer())
    //.post('/graph/', graphMiddleware)
    //.get('/files/:id', downloadFile)
    //.post('/uploadFile', uploadFile)
    .get('(.*)', async(ctx) => {
        ctx.body = await ctx.render({
            url: ctx.url,
            ctx,
            ENV: {
                domain: ENV.domain,
                token: ctx.state.token
            }
        })
    })
    .routes() //return routes