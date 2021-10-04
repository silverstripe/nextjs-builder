//import getProjectDir from "../utils/getProjectDir"
import path from "path"
import os from "os"

//const getCacheDir = (): string => path.join(getProjectDir() ?? ``, `.ss-cache`)

const getCacheDir = (): string => path.join(os.tmpdir(), `ss-cache`)
export default getCacheDir
