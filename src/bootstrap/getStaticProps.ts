import { GetStaticProps } from "next"
import { CoreQueries } from "../../types"
import {
  resolveAncestry,
  linkify,
} from "@silverstripe/nextjs-toolkit"
import { TYPE_RESOLUTION_QUERY } from "../build/queries"
import createGetQueryForType from "../build/createGetQueryForType"
import createClient from "../graphql/createClient"
import { ProjectState } from "@silverstripe/nextjs-toolkit"

const getStaticProps = (project: ProjectState): GetStaticProps => async context => {
  const getQueryForType = createGetQueryForType(project)
  const api = createClient(project.projectConfig)
  const { getPropsManifest, typeAncestry, availableTemplates } = project.cacheManifest
  const page = context?.params?.page ?? []
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
  if (!availableTemplates) {
    throw new Error(`No available templates found`)
  }

  const templates = Object.keys(availableTemplates)
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
  const stage = context.preview ? `DRAFT` : `LIVE`
  const queryStr = getQueryForType(type)
  if (queryStr) {
    data.query = (await api.query(queryStr, { link: url, stage })) ?? null
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
