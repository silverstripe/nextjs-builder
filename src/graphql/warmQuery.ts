import { writeJSONFile } from "../cache/write"
import { loadJSONFile } from "../cache/read"
import { getCacheKey } from "@silverstripe/nextjs-toolkit"
import { Variables } from "./createClient"

const warmQuery = (query: string, variables: Variables, result: unknown) => {
    const key = getCacheKey(query, variables)
    if (!key) {
        return
    }
    const queries = loadJSONFile(`.queryCache.json`) ?? {}
    queries[key] = result
    writeJSONFile(`.queryCache.json`, queries)
}

export default warmQuery