import { collectQueries } from "../build/collectors"
import { relative } from "path"
import cache from "../cache/cache"
import { ProjectConfig } from "@silverstripe/nextjs-toolkit"

export default async (ssConfig: ProjectConfig): Promise<void> => {
    const availableQueries = collectQueries(ssConfig.baseDir)
    const output = [`/** GENERTATED CODE -- DO NOT MODIFY **/`]        

    for (const name in availableQueries) {
        const absPath = availableQueries[name]
        const relPath = relative(cache.dir(), absPath)
        output.push(
    `import ${name} from "${relPath}"`
        )
    }

    output.push(`
    export default {
        ${Object.keys(availableQueries).join(",\n\t")}    
    }
    `)
    cache.writeFile(`.queryManifest.js`,output.join("\n"))

    return Promise.resolve()
}
