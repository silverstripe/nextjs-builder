import { collectTemplates } from "../build/collectors"
import { relative } from "path"
import cache from "../cache/cache"
import { ProjectConfig } from "@silverstripe/nextjs-toolkit"

export default async (ssConfig: ProjectConfig): Promise<void> => {
    const availableTemplates = collectTemplates(ssConfig.baseDir)
    const output = [`/** GENERTATED CODE -- DO NOT MODIFY **/`]        
    output.push(`import dynamic from "next/dynamic"`)

    for (const name in availableTemplates) {
        const absPath = availableTemplates[name]
        const relPath = relative(cache.dir(), absPath)
        output.push(
    `const ${name} = dynamic(() => import('${relPath}'))`     
        )
    }

    output.push(`
    export default {
        ${Object.keys(availableTemplates).join(",\n\t")}    
    }
    `)
    cache.writeFile(`.templateManifest.js`, output.join("\n"))

    return Promise.resolve()
}

