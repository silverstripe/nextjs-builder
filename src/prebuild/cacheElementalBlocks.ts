import { relative } from "path"
import cache from "../cache/write"
import getCacheDir from "../cache/getCacheDir"
import { collectElementalBlocks } from "../build/collectors"
import { ProjectConfig } from "@silverstripe/nextjs-toolkit"
import slash from "../utils/slash"

export default async (ssConfig: ProjectConfig): Promise<void> => {
    if (!ssConfig.elemental) {
        return Promise.resolve()
    }
    const dir = ssConfig.elemental.componentsPath ?? `components/elements`    
    const availableBlocks = collectElementalBlocks(ssConfig.baseDir, dir)
    const output = [`/** GENERTATED CODE -- DO NOT MODIFY **/`]        
    output.push(`import dynamic from "next/dynamic"`)

    for (const name in availableBlocks) {
        const absPath = availableBlocks[name]
        const relPath = slash(relative(getCacheDir(), absPath))
        output.push(
    `const ${name} = dynamic(() => import('${relPath}'))`     
        )
    }

    output.push(`
    export default {
        ${Object.keys(availableBlocks).join(",\n\t")}    
    }
    `)
    cache.writeFile(`.elementalManifest.js`, output.join("\n"))

    return Promise.resolve()
}

