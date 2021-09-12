import { getCacheKey, ProjectConfig } from "@silverstripe/nextjs-toolkit"
import { extractStaticQueries } from "../staticQuery/staticQueryExtractor"
import cache from "../cache/cache"
import createClient from "../graphql/createClient"

export default async (ssConfig: ProjectConfig): Promise<void> => {
    // Extract static queries, and put them in the cache
    const queries = extractStaticQueries(ssConfig.baseDir)
    if (queries.length > 0) {
        console.log(`Static queries extracted: ${queries.length}`)
    }

    const api = createClient(ssConfig)

    const staticQueries: { [key: string]: unknown } = {}
    const promises = queries.map(query => {
        return new Promise<void>((resolve) => {
            api.query(query).then((result) => {
                const key = getCacheKey(query)
                if (key) {
                    staticQueries[key] = result
                }
                resolve()
            })
        })
    })
    return Promise.all(promises)
        .then(() => {
            cache.writeFile(`.staticQueries.json`, JSON.stringify(staticQueries))
        })
}