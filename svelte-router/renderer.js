import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'

import vm from 'vm'
import path from 'path'
import resolveModule from 'resolve'
import NativeModule, { createRequire } from 'module'

const require = createRequire(
    import.meta.url)

export async function createRenderer({ clientManifest, serverManifest, template, basedir }) {
    let entry = serverManifest.entry
    let files = serverManifest.files

    const run = createBundleRunner(entry, files, basedir)

    return {
        async renderToString(context = {}) {
            try {
                let app = await run(context)
                Object.assign(context, {
                    ...app.render(),
                    script: `<script src="${clientManifest.publicPath + clientManifest.entry}"></script>`
                })
                return await template(context)
            } catch (error) {
                throw error
            }
        }
    }
}

export function createBundleRunner(entry, files, basedir) {
    const evaluate = compileModule(files, basedir)
        // new context mode: creates a fresh context and re-evaluate the bundle
        // on each render. Ensures entire application state is fresh for each
        // render, but incurs extra evaluation cost.
    return async(userContext = {}) => {
        const res = evaluate(entry, createSandbox(userContext))
        return typeof res === 'function' ? res(userContext) : res
    }
}

function createSandbox(context) {
    const sandbox = {
        Buffer,
        console,
        process,
        setTimeout,
        setInterval,
        setImmediate,
        clearTimeout,
        clearInterval,
        clearImmediate,
        __SVELTE_SSR_CONTEXT__: context
    }
    sandbox.global = sandbox
    return sandbox
}

function compileModule(files, basedir) {
    const compiledScripts = {}
    const resolvedModules = {}

    function getCompiledScript(filename) {
        if (compiledScripts[filename]) {
            return compiledScripts[filename]
        }
        const code = files[filename]
        const wrapper = NativeModule.wrap(code)
        const script = new vm.Script(wrapper, {
            filename,
            displayErrors: true
        })
        compiledScripts[filename] = script
        return script
    }

    function evaluateModule(filename, sandbox, evaluatedFiles = {}) {
        if (evaluatedFiles[filename]) {
            return evaluatedFiles[filename]
        }

        let runInNewContext = true //remove this

        const script = getCompiledScript(filename)
        const compiledWrapper = runInNewContext === false ?
            script.runInThisContext() :
            script.runInNewContext(sandbox)
        const m = { exports: {} }
        const r = file => {
            file = path.posix.join('.', file)
            if (files[file]) {
                return evaluateModule(file, sandbox, evaluatedFiles)
            } else if (basedir) {
                return require(
                    resolvedModules[file] ||
                    (resolvedModules[file] = resolveModule.sync(file, { basedir }))
                )
            } else {
                return require(file)
            }
        }
        compiledWrapper.call(m.exports, m.exports, r, m)

        const res = Object.prototype.hasOwnProperty.call(m.exports, 'default') ?
            m.exports.default :
            m.exports
        evaluatedFiles[filename] = res
        return res
    }
    return evaluateModule
}