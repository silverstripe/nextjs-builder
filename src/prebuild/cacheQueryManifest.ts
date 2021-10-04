import { collectQueries } from "../build/collectors"
import { relative } from "path"
import { writeFile } from "../cache/write"
import getCacheDir from "../cache/getCacheDir"
import slash from "../utils/slash"
import { ProjectConfig } from "@silverstripe/nextjs-toolkit"

export default async (ssConfig: ProjectConfig): Promise<void> => {
    const availableQueries = collectQueries(ssConfig.baseDir)
    const output = [`/** GENERTATED CODE -- DO NOT MODIFY **/`]        

    for (const name in availableQueries) {
        const absPath = availableQueries[name]
        const relPath = slash(relative(getCacheDir(), absPath))
        output.push(
    `import ${name} from "${relPath}"`
        )
    }

    output.push(`
    export default {
        ${Object.keys(availableQueries).join(",\n\t")}    
    }
    `)
    writeFile(`.queryManifest.js`,output.join("\n"))

    return Promise.resolve()
}
