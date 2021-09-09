/// @ts-ignore
import Cache from "file-system-cache"
import fs from "fs"
import path from "path"

let cacheDir = path.resolve(`${__dirname}../../.cache`)

let inst = Cache({
    basePath: `${process.cwd()}/${cacheDir}`,
})

const init = (dir: string) => {
    if (dir === cacheDir) {
        return
    }
    clear()
    cacheDir = dir    
    inst = Cache({
        basePath: dir
    })
}

export const save = (key: string, content: any): void => {
    inst.setSync(key, content)
}

export const saveJSON = (key: string, content: any): void => {
    save(key, JSON.stringify(content))
}

export const load = (key: string): any | null => {
    return inst.getSync(key)
}

export const loadJSON = (key: string): any | null => {
    const result = load(key)
    if (result) {
        return JSON.parse(result)
    }

    return null
}

export const clear = async (): Promise<void> => {
    fs.rmSync(cacheDir, { recursive: true, force: true })
    fs.mkdirSync(cacheDir)
}

export const writeFile = (name: string, content: string): void => {
    fs.writeFileSync(`${cacheDir}/${name}`, content, `utf8`)
}

export const readFile = (name: string): string  => {
    return fs.readFileSync(`${cacheDir}/${name}`, `utf8`)
}

export const dir = () => cacheDir

export default {
    save,
    saveJSON,
    load,
    loadJSON,
    readFile,
    clear,
    writeFile,
    dir,
    init
}
