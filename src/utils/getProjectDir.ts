import path from "path"
import fs from "fs"

const getProjectDir = (): string | null => {
    let dir = __dirname
    while (dir !== `/`) {
      const candidate = path.join(dir, `next.config.js`)
      if (fs.existsSync(candidate)) {
        return dir
      }

      dir = path.dirname(dir)
    }

    return null
      
}

export default getProjectDir