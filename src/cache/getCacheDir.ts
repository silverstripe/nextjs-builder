import getProjectDir from "../utils/getProjectDir"
import path from "path"

const getCacheDir = (): string => path.join(getProjectDir() ?? ``, `.ss-cache`)

export default getCacheDir
