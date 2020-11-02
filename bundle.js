// 执行webpack构建的入口
const webpack = require('./lib/webpack')
// 获取 webpack.config.js
const options = require('./webpack.config')

webpack(options)