// webpack.config.js

var nodeExternals = require('webpack-node-externals');

module.exports = {

  resolve: {
    extensions: ['.js']
  },
  context: __dirname,
  entry: {
    app: ['./index.js']
  },
  output: {
    path: __dirname+'/build/',
    filename: 'app.js',
    publicPath: '/build/'
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    loaders: [
      {
        test: /(\.js|.jsx)$/,
        exclude:/(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  },
  node: {
    console: false,
    __dirname: false,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}
