const path = require('path')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const webpack=require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')

//判断当前是不是开发环境
const isDev = process.env.NODE_ENV === 'development'

const config=webpackMerge(baseConfig,{
  entry: {
    app: path.join(__dirname, '../client/app.js'),
  },
  output: {
    filename: '[name].[hash].js',
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.join(__dirname, '../client/template.html')
    })
  ]
})

// if (isDev) {
//   config.entry={
//     app:['react-hot-loader/patch',path.join(__dirname,'../client/app.js')]
//   }
//   config.devServer = {
//     host: '0.0.0.0',//代表任何方式进行访问 本地ip localhost都可以
//     port: 8888,
//     contentBase: path.join(__dirname, '../dist'),//告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要
//     hot: true,//开启HMR模式
//     overlay: {
//       errors: true //是否显示错误
//     },
//     publicPath: '/public',
//     historyApiFallback: {//404 对应的路径配置
//       index: '/public/index.html'
//     }
//   }
//   config.plugins.push(new webpack.NamedModulesPlugin(),
//     new webpack.HotModuleReplacementPlugin())
// }
if (isDev) {
  config.entry={
    app:['react-hot-loader/patch',path.join(__dirname,'../client/app.js')]
  }
  config.devServer = {
    host: '0.0.0.0',
    port: 8888,
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
    overlay: {
      errors: true
    },
    publicPath: '/public',
    historyApiFallback: {
      index: '/public/index.html'
    }
  }
  config.plugins.push(new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin())
}
module.exports = config