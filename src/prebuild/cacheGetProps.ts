import { collectGetProps } from "../build/collectors"
import { relative } from "path"
import cache from "../cache/cache"
import { ProjectConfig } from "@silverstripe/nextjs-toolkit"

export default async (ssConfig: ProjectConfig): Promise<void> => {
    const availableFuncs = collectGetProps(ssConfig.baseDir)
    const output = [`/** GENERTATED CODE -- DO NOT MODIFY **/`]        

    for (const name in availableFuncs) {
        const absPath = availableFuncs[name]
        const relPath = relative(cache.dir(), absPath)
        output.push(
    `import ${name} from "${relPath}"`
        )
    }

    output.push(`
    export default {
        ${Object.keys(availableFuncs).join(",\n\t")}    
    }
    `)
    cache.writeFile(`.getPropsManifest.js`,output.join("\n"))

    return Promise.resolve()
}
