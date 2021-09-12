import path from "path"
import getProjectDir from "./getProjectDir";
import { ProjectState } from "@silverstripe/nextjs-toolkit";
import bootProjectConfig from "./bootProjectConfig";

const bootProject = async (): Promise<ProjectState> => {
    const projectDir = getProjectDir()
    if (!projectDir) {
        throw new Error(`Cannot find project dir at ${__dirname}`)
    }
    const project: ProjectState = {
        projectConfig: bootProjectConfig(),
        cacheManifest: await import(path.join(projectDir, `.cache`))
    }

    return project
}

export default bootProject