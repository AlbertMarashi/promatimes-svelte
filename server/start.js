import './utils/env.js' //global env
import Koa from 'koa'
import { createServer } from 'http'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import router from './server-router.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseDirectory = resolve(__dirname, '../')
const distdir = resolve(baseDirectory, './server/dist/')

async function startServer () {
    let app = new Koa()
    let httpServer = createServer(app.callback())

    app.use(await router())

    httpServer.listen(88)
}

startServer().catch(err => console.error(err))
