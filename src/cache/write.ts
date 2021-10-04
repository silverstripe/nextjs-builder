/// @ts-ignore
import Cache from "file-system-cache"
import fs from "fs"
import getCacheDir from "./getCacheDir"


const createCache = () => Cache({ basePath: getCacheDir() })

export const save = (key: string, content: any): void => {
    createCache().setSync(key, content)
}

export const saveJSON = (key: string, content: any): void => {
    save(key, JSON.stringify(content))
}

export const writeJSONFile = (name: string, content: any): void => {
    writeFile(name, JSON.stringify(content))
}

export const clear = async (): Promise<void> => {
    fs.rmSync(getCacheDir(), { recursive: true, force: true })
    fs.mkdirSync(getCacheDir())
}

export const writeFile = (name: string, content: string): void => {
    fs.writeFileSync(`${getCacheDir()}/${name}`, content, `utf8`)
}

export default {
    save,
    saveJSON,
    clear,
    writeFile,
    writeJSONFile,
}
