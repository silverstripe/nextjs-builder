import { GetStaticProps } from "next"
import { CoreQueries } from "../../types"
import { collectTemplates } from "../build/collectors"
import {
  resolveAncestry,
  requireProject,
  linkify,
} from "@silverstripe/nextjs-toolkit"
import { TYPE_RESOLUTION_QUERY } from "../build/queries"
import createGetQueryForType from "../build/createGetQueryForType"
import createClient from "../graphql/createClient"

const getStaticProps: GetStaticProps = async props => {
  const project = requireProject()
  const getQueryForType = createGetQueryForType(project)
  const api = createClient(project.projectConfig)
  const { getPropsManifest, typeAncestry } = project.cacheManifest
  const page = props?.params?.page ?? []
  let url
  if (Array.isArray(page)) {
    url = page.join(`/`)
  } else {
    url = page
  }

  url = linkify(url)

  if (url.match(/\.[^\/]+$/)) {
    console.log(`Not found:`, url)
    return {
      notFound: true,
    }
  }
  const templates = Object.keys(collectTemplates())

  const typeResolutionResult: CoreQueries = await api.query(
    TYPE_RESOLUTION_QUERY,
    { links: [url] }
  )

  if (
    !typeResolutionResult ||
    typeResolutionResult.typesForLinks.length === 0
  ) {
    return {
      notFound: true,
    }
  }

  const data = {
    query: null,
    extraProps: null,
  }

  const result = typeResolutionResult.typesForLinks[0]
  const { type } = result
  // @ts-ignore
  const ancestors = typeAncestry[type] ?? []

  const query = getQueryForType(type)

  if (query) {
    data.query = (await api.query(query, { link: url })) ?? null
  }

  const propsKey = resolveAncestry(
    type,
    ancestors,
    Object.keys(getPropsManifest)
  )
  // @ts-ignore
  const propsFunc = propsKey ? getPropsManifest[propsKey] ?? null : null
  if (propsFunc) {
    data.extraProps = await propsFunc(data.query)
  }

  const componentProps = {
    props: {
      data,
      type,
      templates,
    },
  }
  return componentProps
}

export default getStaticProps
