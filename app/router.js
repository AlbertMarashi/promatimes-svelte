
class Path {
    constructor(path, component, options){

    }
}

export let routes = [
    new Path('/1', () => import('@/pages/1')),
    new Path('/2', () => import('@/pages/2')),
    new Path('/3', () => import('@/pages/3'))
]