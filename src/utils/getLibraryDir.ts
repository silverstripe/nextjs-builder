import path from "path"
import fs from "fs"

const getLibraryDir = (startDir: string | null = null) => {
    let packageDir = startDir ?? __dirname
    while(!fs.existsSync(path.join(packageDir, `package.json`))) {
      packageDir = path.dirname(packageDir)
    }
    return packageDir
}

export default getLibraryDir
