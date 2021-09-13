#!/usr/bin/env node

import bootProjectConfig from "../utils/bootProjectConfig"

;(async () => {
  const commands: { [command: string]: () => Promise<any> } = {
    "build-manifest": () =>
      import("./buildManifest").then(i => i.buildManifest(ssConfig)),
    "scaffold-pages": () =>
      import("./scaffoldPages").then(i => i.scaffoldPages(ssConfig)),
    "scaffold-blocks": () =>
      import("./scaffoldBlocks").then(i => i.scaffoldBlocks(ssConfig)),
    "setup": () => import("./setup").then(i => {
      i.setup(ssConfig)
    }),
  }
  const commandName = process.argv[2]
  const command = commands[commandName] ?? null

  if (commandName === `setup`) {
    // Shim the setup with a fake baseURL so it doesn't fail when setting up the baseURL.
    process.env.SILVERSTRIPE_BASE_URL = `http://example.com`
  }

  const ssConfig = bootProjectConfig()

  if (!command) {
    console.log(`
    Usage
      $ nextjs-toolkit <command>

    Available commands
      ${Object.keys(commands).join(", ")}

  `)
    process.exit(0)
  }

  // Make sure commands gracefully respect termination signals (e.g. from Docker)
  process.on("SIGTERM", () => process.exit(0))
  process.on("SIGINT", () => process.exit(0))

  await command()
})()
