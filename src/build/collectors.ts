// @ts-ignore
import glob from "glob"
import cache from "../cache/cache"
import path from "path"

// Remove once we figure out how to include types.d.ts in the prebuild
interface StringMap {
    [key: string]: string
}

export const createName = (absPath: string): string => {
    const match = path.basename(absPath).match(/^[A-Za-z0-9_]+/)
    if (!match) {
        throw new Error(`Invalid filename ${absPath}`)
    }

    const candidate = match[0]
    if ([`props`, `component`, `query`].includes(candidate)) {
        return path.basename(path.dirname(absPath))
    }

    return candidate
}


export const collectTemplates = (baseDir: string): StringMap => {
    console.log(`collect templates says baseDir`, baseDir)
    const pattern = path.join(baseDir, `src/templates/**/*.{js,jsx,ts,tsx}`)
    console.log('collect templates searches', pattern)
    const existing = cache.loadJSON(pattern)
    if (existing) {
        return existing
    }
    const nameToPath: StringMap = {}
    
    const result = glob.sync(pattern, { absolute: true });
    console.log(`result is `, result)
    result.filter((absPath: string) => (
        !absPath.match(/\.props\.(js|ts)$/)) &&
        !absPath.match(/\/props\.(js|ts)$/)
    )
        .forEach((absPath: string) => {
            nameToPath[createName(absPath)] = absPath
        })

    cache.saveJSON(pattern, nameToPath)
    
    return nameToPath
};


export const collectQueries = (baseDir: string): StringMap => {
    const pattern = path.join(baseDir, `src/**/*.graphql`)

    const existing = cache.loadJSON(pattern)
    
    if (existing) {
        return existing
    }

    const nameToPath: StringMap = {}
    const result = glob.sync(pattern, { absolute: true });
    
    for (const absPath of result) {
        const rel = path.relative(`${process.cwd()}/src`, absPath)
        if (!rel.startsWith(`fragments`)) {
            nameToPath[createName(absPath)] = absPath
        }
    }

    cache.saveJSON(pattern, nameToPath)

    return nameToPath
};


export const collectGetProps = (baseDir: string): StringMap => {
    const patterns = [
        path.join(baseDir, `src/**/*.props.{js,ts}`),
        path.join(baseDir, `src/**/props.{js,ts}`),
    ]
    
    const key = JSON.stringify(patterns)
    const existing = cache.loadJSON(key)
    
    if (existing) {
        return existing
    }

    const nameToPath: StringMap = {}
    let results: Array<string> = [];
    patterns.forEach(pattern => {
        results = [
            ...results,
            ...glob.sync(pattern, { absolute: true })
        ] 
    })
    for (const absPath of results) {
        const rel = path.relative(path.join(baseDir, `src`), absPath)
        if (!rel.startsWith(`fragments`)) {
            nameToPath[createName(absPath)] = absPath
        }
    }

    cache.saveJSON(key, nameToPath)

    return nameToPath
};


export const collectElementalBlocks = (baseDir: string, elementalDir: string): StringMap => {
    const pattern = path.join(baseDir, `src/${elementalDir}/**/*.{js,jsx,ts,tsx}`)
    const existing = cache.loadJSON(pattern)
    if (existing) {
        return existing
    }
    const nameToPath: StringMap = {}
    
    const result = glob.sync(pattern, { absolute: true });
    result.forEach((absPath: string) => {
        nameToPath[createName(absPath)] = absPath
    })

    cache.saveJSON(pattern, nameToPath)

    return nameToPath
};

