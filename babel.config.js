module.exports = (api) => {
  api.cache(true)

  return {
    presets: [
      [
        "@babel/env",
        {
          targets: { electron: require('electron/package.json').version },
          useBuiltIns: 'usage'
        }
      ],
      "@babel/react"
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
    ]
  }
};
