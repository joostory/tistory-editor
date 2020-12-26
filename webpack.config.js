const path = require('path');
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInjector = require('html-webpack-injector')

const config = {
	entry: {
		'editor': path.join(__dirname, 'src', 'renderer', 'index')
  },
	output: {
		path: path.join(__dirname, 'app'),
    filename: '[name].min.js',
    chunkFilename: '[name].min.js'
	},
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template/index.html',
      filename: './index.html'
    }),
    new HtmlWebpackInjector(),
    new MiniCssExtractPlugin({
      filename: "[id].min.css",
      chunkFilename: "[id].min.css"
    })
  ],

	externals: {
    "jsdom": {},
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
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          'css-loader',
          "resolve-url-loader",
          'sass-loader'
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
  target: "electron-renderer",
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}



module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    config.plugins.push(new OptimizeCSSAssetsPlugin({}))
  }

  return config
};

