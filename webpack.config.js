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
  resolve: {
    extensions: ['.js', '.grs', '.css'],
  },
  devServer: {
    contentBase: __dirname,
    inline: true,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /(\.js|\.grs)$/,
        use: [{
          loader: 'babel-loader',
        },{
          loader: 'grass-loader',
          options: {
            path: '@rustle/grass',
          },
        }]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
          loader: 'css-loader',
          options: {
            modules: true,
          },
        }]
      }
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