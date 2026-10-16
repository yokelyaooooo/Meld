module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'Meld',
    ignore: [
      /^\/.artifacts/,
      /^\/docs/,
      /^\/src/,
      /^\/schemas/,
      /^\/examples/,
      /^\/\.github/,
      /^\/node_modules\/\.cache/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'meld',
        authors: 'Meld contributors',
        description: 'Agent-editable, local-first software interfaces with a secure AI-shaped workspace.',
      },
      platforms: ['win32'],
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
}
