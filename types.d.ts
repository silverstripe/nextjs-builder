import React from "react"

export type StringMap = {
    [key: string]: string
}

export type StaticBuildPayload = {
  typeAncestry: Array<TypeAncestry>
  links: Array<StaticBuildLink>
}

export type StaticBuildLink = {
  link: string
}

export type TypeAncestry = {
  type: string
  ancestry: Array<string>
}

export type TypeResolution = {
  type: string
  link: string
}

export type CoreQueries = {
  staticBuild: StaticBuildPayload
  typesForLinks: Array<TypeResolution>
}

export type TypeAncestryManifest = {
    [key: string]: Array<string>
}

export type TemplateManifest = {
    [key: string]: React.ComponentType
}

export type GetPropsManifest = {
    [key: string]: (query: string | null) => Promise<any>
}

export type QueryManifest = {
    [key: string]: any
}

export interface ClientConfig {
    endpoint: string
    options: {
        [key: string]: string | StringMap
        headers: StringMap
    }
  }
  
export interface ProjectConfig {
      prebuild: Array<(config: ProjectConfig) => Promise<any>>
      
      elemental: {
        enabled: boolean,
        fragmentsPath: string
        componentsPath: string,
      }
  
      query: {
        pluraliser: (s: string) => string,
      }
  
      page: {
        ignore: Array<string>
      }
  
      baseURL: string
      
      client: () => ClientConfig
}

export interface CacheManifest {
  templateManifest: TemplateManifest
  getPropsManifest: GetPropsManifest
  typeAncestry: TypeAncestryManifest
  queryManifest: QueryManifest
}

export interface ProjectState {
    cacheManifest: CacheManifest
    projectConfig: ProjectConfig
}
