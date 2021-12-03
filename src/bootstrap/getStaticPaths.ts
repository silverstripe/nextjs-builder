import { GetStaticPaths } from "next"
import { CoreQueries } from "../../types"
import { STATIC_PAYLOAD_QUERY, TYPE_RESOLUTION_QUERY } from "../build/queries"
import createGetQueryForType from "../build/createGetQueryForType"
import createBulkQuery from "../build/createBulkQuery"
import { parse } from "graphql"
import { linkify, ProjectState, getQueryName, hasTopLevelField, getQueryNodes } from "@silverstripe/nextjs-toolkit"
import createClient from "../graphql/createClient"
import warmQuery from "../graphql/warmQuery"

export const getStaticPaths = (project: ProjectState): GetStaticPaths => async (context) => {
  const api = createClient(project.projectConfig)
  const staticPayloadResult: CoreQueries =
    (await api.query(STATIC_PAYLOAD_QUERY)) ?? null

  if (!staticPayloadResult) {
    console.warn(`Could not get a static build!`)
    return Promise.reject()
  }

  // Build a list of all the links that need to statically generated
  const links = staticPayloadResult.staticBuild?.links ?? []
  const paths: Array<{ params: { page: Array<string> } }> = []
  links.forEach(link => {
    paths.push({ params: { page: link.link.split(`/`) } })
  })

  // Warm the cache for future interrogations of link => type
  const typeResolutionResult: CoreQueries = await api.query(
    TYPE_RESOLUTION_QUERY,
    { links: links.map(l => l.link) },
  )

  const typeToLinks = new Map<string, Set<string>>()
  const typeToQuery = new Map<string, string>()
  const getQueryForType = createGetQueryForType(project)

  typeResolutionResult.typesForLinks.forEach(result => {
    warmQuery(
      TYPE_RESOLUTION_QUERY,
      { links: [linkify(result.link)] },
      { typesForLinks: [{ link: result.link, type: result.type }] }
    )

    if (!typeToLinks.has(result.type)) {
      typeToLinks.set(result.type, new Set())
    }
    typeToLinks.get(result.type)?.add(result.link)

    // Capture the query for each type while we're here
    if (!typeToQuery.has(result.type)) {
      const query = getQueryForType(result.type)
      if (query) {
        typeToQuery.set(result.type, query)
      }
    }
  })

  // Bulk query caching
  const bulkQuery = createBulkQuery(project)
  for (let [type, links] of typeToLinks.entries()) {
    const singleQuery = typeToQuery.get(type)
    if (!singleQuery) {
      continue
    }
    const doc = parse(singleQuery)
    const queries = getQueryNodes(doc)

    if (queries.length > 1) {
      console.warn(
        `Query has multiple query fields: ${queries.join(', ')}
                and is ineligible for bulk fetching.`
      )
      continue

    }
    
    const singleQueryName = getQueryName(doc)

    if (!hasTopLevelField(doc, `link`)) {
      console.warn(
        `Query ${singleQueryName} ${singleQuery} does not have a link field in its selection set
                and is ineligible for bulk fetching.`
      )
      continue
    }
    // Rewrite the single record query to multiple, e.g. readOnePage => readPages
    const newQuery = bulkQuery(singleQuery)
    if (!newQuery) {
      continue
    }
    const newQueryName = getQueryName(parse(newQuery))
    if (!newQueryName) {
      continue
    }
    // Bulk fetch the records and warm the cache
    const fetch = api.createChunkFetch(newQuery, {
      limit: 25,
      links: [...links],
    })
    let chunk
    while ((chunk = await fetch())) {
      const records = chunk[newQueryName]?.nodes ?? []
      records.forEach(record => {
        const link = linkify(record.link as string)
        // Bulk queries don't apply to previews
        const stage = `LIVE`
        const queryResult = {
          [singleQueryName!]: record
        }
        warmQuery(singleQuery, { link, stage }, queryResult)
      })
    }
  }

  return {
    paths,
    fallback: `blocking`,
  }
}

export default getStaticPaths
