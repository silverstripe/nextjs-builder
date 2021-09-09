import { glob } from "glob"
import { basename } from "path"
import cache from "../cache/cache"

export default async (): Promise<void> => {
    const output = [
        `/** GENERTATED CODE -- DO NOT MODIFY **/`,
        ``,
    ]
    const vars: Array<string> = []        
    
    const cacheFiles = glob.sync(`${cache.dir()}/{*.js,*.json}`, {
        dot: true,
    })
    cacheFiles.forEach(absPath => {
        const base = basename(absPath)
        const canonicalName = base.match(/^\.([A-Za-z_-]+)/)
        if (!canonicalName) {
            return            
        }
        const varName = canonicalName[1]
        output.push(`import ${varName} from "./${base}"`)
        vars.push(varName)
    })
    output.push(``)
    output.push(`export default {`)
    output.push(vars.join(",\n"))
    output.push(`}`)
    cache.writeFile(`index.js`,output.join("\n"))

    return Promise.resolve()
}
