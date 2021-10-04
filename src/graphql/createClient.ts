import { loadJSONFile } from "../cache/read"
import {
  getCacheKey,
  getQueryName,
  hasPageInfoField,
  ProjectConfig,
} from "@silverstripe/nextjs-toolkit"
import fetch from "node-fetch"
import { parse } from "graphql"

interface ChunkedFetch {
  [key: string]: {
    nodes: Array<{ [key: string]: unknown }>
    pageInfo: {
      hasNextPage: boolean
    }
  }
}

export interface Variables {
  [key: string]: any
}

const createClient = (projectConfig: ProjectConfig) => {

  const query = async (query: string, variables: Variables = {}) => {
    const cacheKey = getCacheKey(query, variables)
    if (cacheKey) {
      const cached = loadJSONFile(`.queryCache.json`) ?? {}
      const existing = cached[cacheKey] ?? null
      if (existing) {
        return existing
      }
    }

    const clientConfig = projectConfig.client()
    if (!clientConfig.endpoint) {
      throw new Error(`
            You have no graphql endpoint specified. Please add it to the "client()" function in ss.config.js
            `)
    }

    clientConfig.options.headers["Content-Type"] = `application/json`
    const options = {
      ...clientConfig.options,
      method: `POST`,
      body: JSON.stringify({
        query,
        variables,
      }),
    }
    try {
      const res = await fetch(clientConfig.endpoint, options)
      const json = await res.json()

      if (json.errors) {
        throw new Error(`
    There was a problem with your GraphQL query:
    
    ${JSON.stringify(json.errors)}
    
    Query:
    
    ${query}
    
    Variables:
    
    ${JSON.stringify(variables)}
    
                `)
      }
      if (json.data) {
        return json.data
      }
    } catch (e) {
      throw new Error(`
    There was a network error during the request:
    
    ${e}
    
    Query:
    
    ${query}
    
    Variables:
    
    ${JSON.stringify(variables)}
    
            `)
    }

    return null

  }


  const createChunkFetch = (queryStr: string, variables: Variables = {}) => {
    const doc = parse(queryStr)
    const queryName = getQueryName(doc)
    if (!queryName) {
      throw new Error(`No query name found on ${queryStr}`)
    }
    if (!hasPageInfoField(doc)) {
      throw new Error(
        `Cannot chunk query ${queryName} because it has no pageInfo selection`
      )
    }
    const limit = variables.limit ?? 100
    let offset = 0
    let hasMore = true

    const fetcher = async (): Promise<ChunkedFetch | null> => {
      if (!hasMore) {
        return null
      }
      const paginatedVariables = {
        ...variables,
        limit,
        offset,
      }
      const result = await query(queryStr, paginatedVariables)
      hasMore = result[queryName].pageInfo.hasNextPage
      offset += limit

      return result
    }

    return fetcher
  }

  return {
    query,
    createChunkFetch,
  }
}

export default createClient
