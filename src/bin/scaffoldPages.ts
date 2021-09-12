#!/usr/bin/env node

import path from "path"
import fs from "fs"
import { ProjectConfig } from "@silverstripe/nextjs-toolkit"
import createClient from "../graphql/createClient"
import getLibraryDir from "../utils/getLibraryDir"
import glob from "glob"

interface FragmentResult {
  type: string
  fragment: string
}

const query = `
query PageFragments($baseClass: String!, $baseFields: [String!]) {
    generateFragments(baseClass: $baseClass, baseFields: $baseFields) {
        type
        fragment
    }

}
`
const variables = {
  baseClass: "Page",
  includeBase: true,
}
const libraryDir = getLibraryDir()
if (!libraryDir) {
  throw new Error(`Could not find package dir at ${__dirname}`)
}

const templatePath = (name: string) => (
  path.join(libraryDir, `src/server/templates/${name}.template`)
)

export const scaffoldPages = (ssConfig: ProjectConfig) => {
  const projectDir = ssConfig.baseDir
  const ignore = ssConfig.page?.ignore ?? []
  const absComponentsPath = path.resolve(projectDir, `src/templates`)
  
  let elementalAreaPath: string
  if (ssConfig.elemental.enabled) {
    const absElementalPath = path.resolve(absComponentsPath, `../components/elements`)
    fs.mkdirSync(absElementalPath, { recursive: true })
    const elementalPageSrc = fs.readFileSync(
      templatePath(`elementalArea`),
      { encoding: `utf8` }
    )
    const existing = glob.sync(
      `${projectDir}/**/ElementalArea{.tsx,.jsx}`,
      { absolute: true }
    )
    if (!existing.length) {
      elementalAreaPath = path.join(absElementalPath, `ElementalArea.tsx`)
      fs.writeFileSync(elementalAreaPath, elementalPageSrc)      
    } else {
      console.log(`ElementalArea already exists. Skipping.`)
      elementalAreaPath = existing[0]
    }

  }
  
  const absPageTemplatePath = templatePath(`page`)
  const absQueryPath = templatePath(`pageQuery`)
  const absElementalPageTemplatePath = templatePath(`elementalPage`)

  const requiredTemplates = [
    absPageTemplatePath,
    absElementalPageTemplatePath,
    absQueryPath,
  ]
  requiredTemplates.forEach((templatePath: string) => {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${templatePath} does not exist`)
    }
  })

  const templateContents = ssConfig.elemental.enabled
    ? fs.readFileSync(absElementalPageTemplatePath, { encoding: `utf8` })
    : fs.readFileSync(absPageTemplatePath, { encoding: `utf8` })

  const queryContents = fs.readFileSync(absQueryPath, { encoding: `utf8` })

  const api = createClient(ssConfig)

  api.queryUncached(query, variables).then(result => {
    result.generateFragments.forEach((result: FragmentResult) => {
      if (ignore.includes(result.type)) {
        return
      }

      const pageDir = path.join(absComponentsPath, result.type)
      fs.mkdirSync(pageDir, { recursive: true })

      const componentPath = path.join(pageDir, `component.tsx`)

      const queryName = `readOne${result.fragment ? result.type : `Page`}`

      // If no component exists for this block, create it
      if (!fs.existsSync(componentPath)) {
        let code = templateContents
          .replace(/<%templateName%>/g, result.type)
          .replace(/<%queryName%>/g, queryName)
        if (elementalAreaPath) {
          code = code.replace(
            /<%elementalAreaPath%>/g,
            path.relative(
              path.dirname(componentPath),
              // remove extension
              elementalAreaPath.split(`.`).slice(0, -1).join(`.`)

            )
          )
        }
        fs.writeFileSync(componentPath, code)

        console.log(`Generated new component for ${result.type}`)
      }

      const target = path.join(pageDir, `query.graphql`)

      // If the query exists already, don't overwrite it
      if (fs.existsSync(target)) {
        return
      }

      const query = queryContents
        .replace(/<%queryName%>/g, queryName)
        .replace(
          /<%operationName%>/g,
          `${queryName.charAt(0).toUpperCase()}${queryName.slice(1)}`
        )
      fs.writeFileSync(target, query)
      console.log(`Wrote new query for ${result.type}`)
    })
  })
}

export default scaffoldPages
