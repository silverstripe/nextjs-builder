import { ProjectConfig } from "@silverstripe/nextjs-toolkit"
import { writeJSONFile } from "../cache/write"
import createClient from "../graphql/createClient"

export default async (ssConfig: ProjectConfig): Promise<void> => {
    const api = createClient(ssConfig)
    const BUILD_QUERY = `
    query StaticBuild {
        staticBuild {
            typeAncestry {
                type
                ancestry
            }
        }

    }
    `
    return api.query(BUILD_QUERY)
        .then(({ staticBuild: { typeAncestry } }) => {
            const ancestryMap: { [key: string]: Array<string> } = {}
            typeAncestry.forEach((result: { type: string, ancestry: Array<string> }) => {
                ancestryMap[result.type] = result.ancestry
            })  
            writeJSONFile(`.typeAncestry.json`, ancestryMap)

        })
}
