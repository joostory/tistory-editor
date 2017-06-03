var path = require('path');
var webpack = require("webpack");

module.exports = {
	entry: [
		path.join(__dirname, 'src', 'renderer', 'index')
	],
	output: {
		path: path.join(__dirname, 'app'),
		publicPath: '/assets/',
		filename: 'editor.min.js'
	},
	plugins: process.env.NODE_ENV !== "production" ? [] : [
		new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_console: true
      }
    }),
		new webpack.DefinePlugin({
		  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
		})
	],
	externals: {
    "jsdom": {},
		"codemirror": "CodeMirror",
		"tinymce": "tinymce"
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
				test: /\.css$/,
				use: [
					"style-loader",
					"css-loader"
				]
			}
		]
	},
	target: "electron"
}
