import { getFragments, getQueryFields, getQueryName } from "@silverstripe/nextjs-toolkit";
import { parse } from "graphql"
import { defaultPluraliser, ProjectState } from "@silverstripe/nextjs-toolkit";

const createBulkQuery = ({ projectConfig }: ProjectState) => (query: string): string | null => {
    const doc = parse(query)
    const fields = getQueryFields(query)
    const queryName = getQueryName(doc)
    const pluraliser = projectConfig?.query.pluraliser ?? defaultPluraliser

    if (!fields || !queryName) {
        throw new Error(
            `Query is not properly formatted. Must have a query name and field selection:
                ${query}
            `
        )
    }

    if (!queryName.startsWith(`readOne`)) {
        console.log(`Query "${queryName} is not a standard read query. Cannot bulk fetch.`)
        return null
    }

    const suffix = queryName.substring(7)
    const plural = pluraliser(suffix)
    const bulkQueryName = `read${plural}`
    const fragments = getFragments(query)

    const bulkQuery = `
query Bulk${suffix} ($links: [String!]!, $limit: Int, $offset: Int) {
    ${bulkQueryName}(links: $links, limit: $limit, offset: $offset) {
        nodes {
            ${fields}
        }
        pageInfo {
            hasNextPage
        }
    }
}
${fragments}    
    `

    return bulkQuery
}

export default createBulkQuery