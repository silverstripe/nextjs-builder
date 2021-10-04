/// @ts-ignore
import Cache from "file-system-cache"
import fs from "fs"
import path from "path"
import getProjectDir from "../utils/getProjectDir"

let cacheDir = path.join(getProjectDir() ?? ``, `.ss-cache`)

const createCache = () => Cache({ basePath: cacheDir })

export const load = (key: string): any | null => {
    return createCache().getSync(key)
}

export const loadJSON = (key: string): any | null => {
    const result = load(key)
    if (result) {
        return JSON.parse(result)
    }

    return null
}

export const loadJSONFile = (name: string): any | null => {
    const result = readFile(name)
    if (!result) {
        return null
    }

    return JSON.parse(result)
}

export const readFile = (name: string): string | null  => {
    try {
        return fs.readFileSync(`${cacheDir}/${name}`, `utf8`)
    } catch (_) {
        return null
    }
}

export default {
    load,
    loadJSON,
    readFile,
    loadJSONFile,
}
