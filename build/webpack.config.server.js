//此js用来将client/server-entry.js 打包成node能够执行的文件
const path = require('path')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')

const config=webpackMerge(baseConfig,{
  target: 'node',//打包成node端执行
  entry: {
    app: path.join(__dirname, '../client/server-entry.js'),
  },
  output: {
    filename: 'server-entry.js',
    libraryTarget: 'commonjs2'//使用配置方案 commonjs2
  },
})

module.exports = config
