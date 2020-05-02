import Koa from 'koa'
import { createServer } from 'http'

async function startServer() {
    let app = new Koa()
    let httpServer = createServer(app.callback())

    app.use(async ctx => { ctx.body = 'Hello sdadsd' })

    httpServer.listen(88)
}

startServer().catch(err => console.error(err))