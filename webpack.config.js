const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: resolve('./index.js'),
  output: {
    path: resolve('dist'),
    filename: 'bundle.js',
  },
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: __dirname,
    inline: true,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        use: [{
          loader: "babel-loader",
        }]
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: resolve('./index.html'),
    }),
  ],
}

function resolve (dir) {
  return path.resolve(__dirname, dir)
}