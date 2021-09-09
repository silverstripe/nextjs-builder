#!/usr/bin/env node

import cacheStaticQueries from "../prebuild/cacheStaticQueries"
import cacheQueryManifest from "../prebuild/cacheQueryManifest"
import cacheTypeAncestry from "../prebuild/cacheTypeAncestry"
import cacheTemplateManifest from "../prebuild/cacheTemplateManifest"
import cacheGetProps from "../prebuild/cacheGetProps"

import { ProjectConfig } from "@silverstripe/nextjs-toolkit"
import createCacheManifest from "../prebuild/createCacheManifest"

export const buildManifest = (ssConfig: ProjectConfig): Promise<void> => {
  const preBuildSteps = [
    cacheStaticQueries,
    cacheQueryManifest,
    cacheTypeAncestry,
    cacheTemplateManifest,
    cacheGetProps,
    ...(ssConfig.prebuild ?? []),
  ]

  const promises = preBuildSteps.map(func => func(ssConfig))
  return Promise.all(promises)
    .then(() => {
      createCacheManifest().then(() => {
        console.log(`Prebuild complete`)
      })
    })
    .catch(e => {
      console.error(`
Error received while building the manifest:

${e.message}


        `)
    })
}

export default buildManifest
