import App from '@/app.svelte'
import { Path, Router, middleware, prefix } from '../svelte-router/index'

export default function (context) {
    return App
    let routes = [
        new Path('/', () => import ('@/home')),
        new Path('/about', () => import ('@/about')),
        ...prefix('/app', [
            new Path('/admin'),
            new Path('/', () => import('@/client'))
        ]),
        ...middleware(authMiddleware, [
            new Path('/:slug', async ({url, params: { slug }}) => {
                let templateName = askServerForTemplateName(slug)
        
                if(articleTemplates[templateName]) return await articleTemplates[templateName]()
            })
        ])
    ]

    let router = new Router({ routes })
    App.component = router.push(context.url)

}
