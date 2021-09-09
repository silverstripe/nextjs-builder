import path from "path"
import fs from "fs"

const getProjectDir = (): string | null => {
    let configFilePath
    for (const p of module.paths) {
      const candidate = path.join(path.dirname(p), `ss.config.ts`)
      if (fs.existsSync(candidate)) {
        configFilePath = candidate
        break
      }
    }
    if (!configFilePath) {
      return null
    }

    return path.dirname(configFilePath)
  
}

export default getProjectDir