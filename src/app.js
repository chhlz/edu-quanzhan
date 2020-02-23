import express from 'express'
import config from './config'
import indexRouter from './routes/index'
import advertRouter from './routes/advert'
import errLog from './middlewares/error_log'
import bodyParser from './middlewares/body_parser'

const app = express()
const nunjucks = require('nunjucks')

//设置静态资源所在路径，参数1为访问时的虚拟路径
app.use('/node_modules',express.static(config.node_modules_path))
app.use('/public',express.static(config.public_path))

//设置视图资源位置和所用视图引擎

//使用ejs模板引擎时
//app.set('views',config.viewPath)
//app.set('view engine','ejs')

//使用nunjucks模板引擎时（结合express框架时）
nunjucks.configure(config.viewPath,{
	autoescape:true,
	express:app,
	noCache:true //不使用缓存
})

//处理post请求体的中间件
app.use(bodyParser)

//加载路由容器的中间件（由于路由容器已经按照模块分类了，要分别加载每个模块所需的路由容器）
app.use(indexRouter)
app.use(advertRouter)

//全局错误处理中间件，此句必须在加载路由容器之后，因为处理的是加载路由容器时可能会发生的错误，发生错误时在此中间件进行匹配
app.use(errLog)

app.listen(3000,()=>{
	console.log('server is running at port 3000...')
})
 