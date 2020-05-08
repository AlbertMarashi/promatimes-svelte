import { Path as PathRegex } from 'path-parser'

import HTML5History from './history/html5'
import AbstractHistory from './history/abstract'

export class Path {
    constructor (url, component) {
        this.url = url
        this.middleware = []
        this.component = component
    }

    get regex () {
        return new PathRegex(url)
    }

    async doMiddleware(){
        
    }
}

export class Router {
    constructor({ routes }) {
        this.routes = routes

        if (!inBrowser) { // history api
            this.history = new AbstractHistory(this)
        } else {
            this.history = new HTML5History(this)
        }

        if (history instanceof HTML5History) {
            this.history(this.history.getCurrentLocation())
        }
    }

    get currentRoute() {
        return this.history && this.history.current
    }

    async push(url) {
        await this.history.push(url)
    }

    async go(n) {
        await this.history.go(n)
    }

    async back() {
        await this.go(-1)
    }

    async forward() {
        await this.go(1)
    }
}

export function prefix(prefix, paths){
    return paths.map(path => {
        path.url = prefix + path.url
        return path
    })
}

export function middleware(fns, paths) {
    return paths.map(path => {
        path.middleware.push(...fns)
        return path
    })
}
