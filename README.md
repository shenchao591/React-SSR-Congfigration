> 技术栈：webpack3.9.1+webpack-dev-server2.9.5+React16.x + express4.x

# 前言
 > (**好慌！可能是因为我很懒**,导致...,然后，好吧，没有然后了。。。切入正题ing，let's do it！！！)

 网上关于React的SSR也很多，但都不够详细，有的甚至让初学者一头雾水。不过这篇文章我将一步步详细的介绍，从0开始配置React SSR，让每个看到文章的人都能上手。

 # SSR的概念
 **Server Slide Rendering**，缩写为 **SSR**，即**服务器端渲染**，因为是之前搞java出身，也明白是怎么回事，只是没具体名词的概念罢了，其实SSR主要针对 SPA应用，目的大概有以下几个：
 > 1. 解决单页面应用的 SEO
 单页应用页面大部分主要的 HTML并不是服务器返回，服务器只是返回一大串的脚本，页面上看到的大部分内容都是由脚本生成，对于一般网站影响不大，但是对于一些依赖搜索引擎带来流量的网站来说则是致命的，搜索引擎无法抓取页面相关内容，也就是用户搜不到此网站的相关信息，自然也就无流量可言。
 > 2. 解决渲染白屏
 因为页面 HTML由服务器端返回的脚本生成，一般来说这种脚本的体积都不会太小，客户端下载需要时间，浏览器解析以生成页面元素也需要时间，这必然会导致页面的显示速度比传统服务器端渲染得要慢，很容易出现首页白屏的情况，甚至如果浏览器禁用了 JS，那么将直接导致页面连基本的元素都看不到。

 # React中如何使用服务端渲染
 > react-dom是React专门为web端开发的渲染工具。我们可以在客户端使用react-dom的render方法渲染组件，而在服务端，react-dom/server提供我们将react组件渲染成html的方法。

 > 浏览器渲染与服务端渲染对比如下：（其中红色框内就是服务端渲染，很显然比起浏览器渲染快了很多）

![](https://user-gold-cdn.xitu.io/2018/5/3/16322144a5ddb3c7?w=1258&h=834&f=jpeg&s=90508)

 # 项目搭建

 项目结构图如下：
![项目结构](https://user-gold-cdn.xitu.io/2018/5/2/16320912ac7c3a67?w=730&h=590&f=jpeg&s=63879)

 > build文件夹 用来配置webpack环境
   - webpack.config.base.js是基础配置
   - webpack.config.client.js是客户端打包配置
   - webpack.config.server.js是用来打包服务器渲染的配置

   package.json:
 ```javascript
 {
  "name": "juejin-reactssr",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build:client": "webpack --config build/webpack.config.client.js",
    "build:server": "webpack --config build/webpack.config.server.js",
    "clear": "rimraf dist",
    "build": "npm run clear && npm run build:client && npm run build:server",
    "start":"node server/server.js"
  },
  "author": "Jerry",
  "license": "ISC",
  "dependencies": {
    "express": "^4.16.3",
    "react": "^16.2.0",
    "react-dom": "^16.2.0",
    "react-router": "^4.2.0",
    "react-router-dom": "^4.2.2"
  },
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-loader": "^7.1.2",
    "babel-plugin-transform-decorators-legacy": "^1.3.4",
    "babel-preset-es2015": "^6.24.1",
    "babel-preset-es2015-loose": "^8.0.0",
    "babel-preset-react": "^6.24.1",
    "babel-preset-stage-1": "^6.24.1",
    "cross-env": "^5.1.1",
    "file-loader": "^1.1.5",
    "html-webpack-plugin": "^2.30.1",
    "http-proxy-middleware": "^0.17.4",
    "memory-fs": "^0.4.1",
    "react-hot-loader": "^3.1.3",
    "rimraf": "^2.6.2",
    "uglifyjs-webpack-plugin": "^1.1.2",
    "webpack": "^3.9.1",
    "webpack-dev-server": "^2.9.5",
    "webpack-merge": "^4.1.2"
  }
}

webpack.config.base.js:

```javascript
const path = require('path')
module.exports = {
  output: {
    path: path.join(__dirname, '../dist'),
    publicPath: '/public/',
  },
  devtool:"source-map",
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      }
    ]
  },
}

```

 ```
 webpack.config.server.js:
 ```javascript
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

 ```

 > client文件夹 客户端用来打包上线

 app.js:
 ```javascript
 import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'

ReactDOM.render(<App/>, document.getElementById('root'))

 ```
 App.jsx:
 ```javascript
 import React from 'react'
export default class App extends React.Component{
  render(){
    return (
      <div>
        App
      </div>
    )
  }
}
 ```
 server-entry.js:此文件用来生成服务器渲染所需模板
 ```javascript
 //服务端用来渲染的模板
import React from 'react'
import App from './App.jsx'
export default <App/>
 ```
 template.html:
 ```javascript
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<div id="root"><!-- app --></div>
</body>
</html>
 ```
 > server文件夹 对应服务端
 ```javascript
 const express = require('express')
const ReactSSR = require('react-dom/server')
const serverEntry = require('../dist/server-entry')
const app = express()

app.get('*', function (req, res) {
  //ReactDOMServer.renderToString则是把React实例渲染成HTML标签
  let appString = ReactSSR.renderToString(serverEntry.default);
  //返回给客户端
  res.send(appString);
})
app.listen(3000, function () {
  console.log('server is listening on 3000 port');
})
 ```

 # 接下来
 我们运行 npm start ，打开浏览器输入http://localhost:3000/
 我们发现服务器返回渲染的模板 ，到这里为止我们达到了最简单的SSR的目的（但是这还不是我们的最终目的，因为这里单单返回的只有渲染的模板，我们需要返回整个页面，页面中可能还引用其他的js等文件）

![](https://user-gold-cdn.xitu.io/2018/5/2/16320afb161566c6?w=1660&h=682&f=jpeg&s=122609)

# 继续完善

我们回到server端，改进我们的server.js, **+** 所在行表示新增的内容
```javascript
const express = require('express')
const ReactSSR = require('react-dom/server')
const serverEntry = require('../dist/server-entry')
+ const fs=require('fs')
+ const path=require('path')
const app = express()

// 引入npm run build生成的index.html文件
+ const template=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8')
app.get('*', function (req, res) {
  //ReactDOMServer.renderToString则是把React实例渲染成HTML标签
  let appString = ReactSSR.renderToString(serverEntry.default);
  //<!--App-->位置 就是我们渲染返回的结果插入的位置
  + appString=template.replace('<!--App-->',appString);
  //返回给客户端
  res.send(appString);
})
app.listen(3000, function () {
  console.log('server is listening on 3000 port');
})
```

控制台 npm start ，打开浏览器输入http://localhost:3000/
发现，页面引用的app.js文件也同样返回的是整个页面，这显然不是我们所想要的

![](https://user-gold-cdn.xitu.io/2018/5/2/16320cc8c77d4ade?w=2266&h=1044&f=jpeg&s=229291)

![](https://user-gold-cdn.xitu.io/2018/5/2/16320cec1d6557be?w=2348&h=1098&f=jpeg&s=252360)

那是因为我们server.js中 `app.get('*', function (req, res) {}`这个是对所有请求都是一样的处理返回整个页面  ，所以我们要对静态页面单独处理，我们加上static中间件j就可以了
```javascript
const express = require('express')
const ReactSSR = require('react-dom/server')
const serverEntry = require('../dist/server-entry')
const fs=require('fs')
const path=require('path')
const app = express()
//处理静态文件 凡是通过 /public访问的都是静态文件
+ app.use('/public',express.static(path.join(__dirname,"../dist")))
const template=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8')
app.get('*', function (req, res) {
  //ReactDOMServer.renderToString则是把React实例渲染成HTML标签
  let appString = ReactSSR.renderToString(serverEntry.default);
  //<!--App-->位置 就是我们渲染返回的结果插入的位置
  appString=template.replace('<!-- app -->',appString);
  //返回给客户端
  res.send(appString);
})
app.listen(3000, function () {
  console.log('server is listening on 3000 port');
})
```


![](https://user-gold-cdn.xitu.io/2018/5/2/16320df23586fd1b?w=2532&h=1270&f=jpeg&s=427953)

这样app.js返回的就是对应的js内容了，而不是整个页面了

> 以上就是我们服务端ssr的整个流程（PS：当然目前还有个不好的地方就是，我们都直接命令行启动webpack进行打包，就可以满足我们的需求。但毕竟计划赶不上变化，有时候你会发现用命令行启动webpack变得不是那么方便。比如我们在调试react的服务端渲染的时候，我们不可能每次有文件更新，等着webpack打包完输出到硬盘上某个文件，然后你重启服务度去加载这个新的文件，因为这太浪费时间了，毕竟开发时你随时都可能改代码，而且改动可能还很小。）

> 那么要解决这个问题怎么办呢？我们可以在启动nodejs服务的时候，顺带启动webpack打包服务，这样我们可以在nodejs的执行环境中拿到webpack打包的上下文，就可以不重启服务但每次文件更新都可以拿到最新的bundle。


## 这个问题我们先放在这里 (todo...)

![](https://user-gold-cdn.xitu.io/2018/5/2/16320f0bdf7d5412?w=500&h=500&f=gif&s=26389)

接下来，我们先来看看wepack-dev-server 以及 模块热替换(Hot Module Replacement 或 HMR)是 webpack 提供的最有用的功能之一。它允许在运行时更新各种模块，而无需进行完全刷新。)

> wepack-dev-server 和 HMR 不适用于生产环境，这意味着它应当只在开发环境使用，接下来我们来配置开发环境

# webpack-dev-server配置
首先，package.json
```javascript
"scripts": {
    "build:client": "webpack --config build/webpack.config.client.js",
    "build:server": "webpack --config build/webpack.config.server.js",
    + "dev:client":"cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.client.js",
    "clear": "rimraf dist",
    "build": "npm run clear && npm run build:client && npm run build:server",
    "start":"node server/server.js"
  }
```

webpack.config.client.js
```javascript
const path = require('path')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
+ const webpack=require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')

//判断当前是不是开发环境
+ const isDev = process.env.NODE_ENV === 'development'

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

// localhost:8888/filename
+ if (isDev) {
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    host: '0.0.0.0',//代表任何方式进行访问 本地ip localhost都可以
    compress: true,
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),//告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要
    hot: true,//开启HMR模式
    overlay: {
      errors: true //是否显示错误
    },
    publicPath: '/public',
    historyApiFallback: {//404 对应的路径配置
      index: '/public/index.html'
    }
  }
  config.plugins.push(new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin())
}

module.exports = config
```
app.js:
```javascript
import React from 'react'
import ReactDOM from 'react-dom'
+ import {AppContainer} from 'react-hot-loader'
import App from "./App.jsx";
+ const root=document.getElementById('root');
+ const render=Component=>{
  ReactDOM.render(<AppContainer><Component/></AppContainer>,root)

}
+ render(App);
+ if(module.hot){
  module.hot.accept('./App.jsx',()=>{
    const NextApp =require('./App.jsx').default;
    render(NextApp);
  })
}
```

以上，devServer以及HMR已经配置完成

![](https://user-gold-cdn.xitu.io/2018/5/3/163221dbc6999769?w=2076&h=980&f=jpeg&s=179722)

 修改App.jsx内容 可以看到页面无刷新就改变内容了

 # 回到之前未完待续的地方 （完成开发时的服务端渲染工作）

 在server.js中我们区分环境变量
 ```javascript
 const express = require('express')
const ReactSSR = require('react-dom/server')

const fs = require('fs')
const path = require('path')
const app = express()

+ const isDev = process.env.NODE_ENV === 'development'
+ if (!isDev) {//生产环境 直接到生成的dist目录读取文件
  const serverEntry = require('../dist/server-entry')
  //处理静态文件 凡是通过 /public访问的都是静态文件
  app.use('/public', express.static(path.join(__dirname, "../dist")))
  const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8')
  app.get('*', function (req, res) {
    //ReactDOMServer.renderToString则是把React实例渲染成HTML标签
    let appString = ReactSSR.renderToString(serverEntry.default);
    //<!--App-->位置 就是我们渲染返回的结果插入的位置
    appString = template.replace('<!-- app -->', appString);
    //返回给客户端
    res.send(appString);
  })
} else {//开发环境 我们从内存中直接读取 减去了写到硬盘上的时间
  const devStatic = require('./util/dev-static')
  devStatic(app);
}


app.listen(3000, function () {
  console.log('server is listening on 3000 port');
})
 ```

 server目录下新建dev-static.js 用来处理开发时候的服务端渲染
 ```javascript
 const axios = require('axios')
const webpack = require('webpack')
const path = require('path')
const serverConfig = require('../../build/webpack.config.server')
const ReactSSR = require('react-dom/server')
const MemoryFs = require('memory-fs')
const proxy = require('http-proxy-middleware')

//getTemplate用来获取打包后的模板（内存中）
const getTemplate = () => {
  return new Promise((resolve, reject) => {
    //http去获取dev-server中的index.html
    axios.get('http://localhost:8888/public/index.html')
      .then(res => {
        resolve(res.data)
      }).catch(reject)
  })
}

const Module = module.constructor;

//node环境中启动一个webpack 来获取打包后的server-entry.js
const mfs = new MemoryFs

//服务端使用webpack
const serverCompiler = webpack(serverConfig);
serverCompiler.outputFileSystem = mfs
let serverBundle
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err
  stats = stats.toJSON()
  stats.errors.forEach(err => console.error(err))
  stats.warnings.forEach(warn => console.warn(warn))

  // 获取bundle文件路径
  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )
  const bundle = mfs.readFileSync(bundlePath, 'utf8')
  const m = new Module()
  m._compile(bundle, 'server-entry.js')
  serverBundle = m.exports.default
})

module.exports = function (app) {
//http 代理：所有通过/public访问的 都代理到http://localhost:8888
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))
  app.get('*', function (req, res) {
    getTemplate().then(template => {
      let content = ReactSSR.renderToString(serverBundle);
      res.send(template.replace('<!-- app -->', content));
    })

  })
}
 ```
 同时，npm scripts配置如下：
 ```javascript
 "scripts": {
    "build:client": "webpack --config build/webpack.config.client.js",
    "build:server": "webpack --config build/webpack.config.server.js",
    "dev:client": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.client.js",
    "dev:server": "cross-env NODE_ENV=development node server/server.js",
    "clear": "rimraf dist",
    "build": "npm run clear && npm run build:client && npm run build:server"
  },
 ```

 运行 npm run dev:client 和npm run dev:server，修改App.jsx的内容 浏览器无刷新更新

![](https://user-gold-cdn.xitu.io/2018/5/3/16325e317b971ce8?w=2542&h=1200&f=jpeg&s=284107)

**以上就是最基础的React SSR和HMR的配置，但还未涉及到数据以及路由等情况，接下来有时间我会在这个基础上为大家带来mobx和react-router等整个项目的配置和部署**










