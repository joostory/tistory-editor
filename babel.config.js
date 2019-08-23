module.exports = (api) => {
  api.cache(true)

  return {
    presets: [
      [
        "@babel/env",
        {
          targets: { electron: require('electron/package.json').version },
          useBuiltIns: 'usage',
          corejs: "core-js@3"
        }
      ],
      "@babel/react"
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
    ]
  }
};
