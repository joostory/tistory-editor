const path = require('path');
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
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
          'sass-loader',
          "resolve-url-loader"
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
}



module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    config.optimization = {
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all'
      }
    }
  }

  return config
};

