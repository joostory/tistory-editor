var path = require('path');
var webpack = require("webpack");

module.exports = {
	entry: [
		path.join(__dirname, 'src', 'renderer', 'index')
	],
	output: {
		path: path.join(__dirname, 'app'),
		filename: 'editor.min.js'
	},
	plugins: [],
	externals: {
    "jsdom": {},
		"codemirror": "CodeMirror",
		"highlightjs": "hljs"
  },
	module: {
		rules: [
			{
				test: /\.js$/,
				use: ['babel-loader'],
				exclude: /node_modules/,
				include: __dirname
			},
			{
				test: /\.s?css$/,
				use: [
					"style-loader",
          "css-loader",
          "resolve-url-loader",
          "sass-loader"
				]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          "file-loader"
        ]
      }
		]
	},
	target: "electron-renderer"
}
