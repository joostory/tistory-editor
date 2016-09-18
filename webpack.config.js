var path = require('path');
var webpack = require("webpack");

module.exports = {
	entry: [
		"./src/index"
	],
	output: {
		path: path.join(__dirname, 'build'),
		publicPath: '/assets/',
		filename: process.env.NODE_ENV !== "production" ? 'editor.js' : 'editor.min.js'
	},
	plugins: process.env.NODE_ENV !== "production" ? [] : [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin()
	],
	module: {
		loaders: [{
			test: /\.js$/,
			loaders: ['babel-loader'],
			exclude: /node_modules/,
			include: __dirname
		}, {
			test: /\.css$/,
			loader: "style-loader!css-loader"
		}]
	}

}
