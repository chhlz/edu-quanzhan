import express from 'express'
import * as indexController from '../controllers/index' //加载所有通过export暴露的成员

//创建路由容器，它可以挂载所有的路由中间件
const router = express.Router()

//制定所有的路由规则，它们都是挂载到路由容器上的路由中间件

//router.get('/',(req,res,next)=>{
//	res.render('index.html')
//})

router.get('/', indexController.showIndex)

//暴露该路由容器
export default router