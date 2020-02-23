import express from 'express'
import mongodb from 'mongodb'
import Advert from './models/advert'

//mongoDB原生写法，使用mongoose时不需要
//const MongoClient = mongodb.MongoClient
//const url = 'mongodb://localhost:27017/edu'

//创建路由容器，它可以挂载所有的路由中间件
const router = express.Router()


//制定所有的路由规则，它们都是挂载到路由容器上的路由中间件

router.get('/',(req,res,next)=>{
	res.render('index.html')
})

//用来测试全局错误处理中间件
router.get('/aa',(req,res,next)=>{
	try{
		JSON.parse('{dsadsa')
	}catch(e){
		next(e)
	}
})

//用来向数据库进行广告添加的中间件
router.post('/advert/add',(req,res,next)=>{
	/*mongoDB的原生写法*/
//	//连接到url指定的MongoDB数据库
//	MongoClient.connect(url,(err,db)=>{
//		//如果连接数据库报错
//		if(err){
//			//调用next(err)将错误传给下一个匹配的全局错误处理中间件进行处理，return则确保不再向后执行
//			return next(err)
//		}
//		//获取数据库'edu'中名为'adverts'的集合（没有则会创建），向其中插入一条数据
//		db.db('edu')
//			.collection('adverts')
//			.insertOne(req.body,(err,result)=>{
//				if(err){
//					throw err
//				}
//				console.log(result)
//				//响应给客户端json格式数据
//				res.json({
//					err_code:0
//				})
//			})
//		db.close()
//	})

	/*使用mongoose的写法*/
	//获取请求体
	const body = req.body;
	//新建一个广告模型对象
	const advert = new Advert({
		title:body.title,
		image:body.image,
		link:body.link,
		start_time:body.start_time,
		end_time:body.end_time
	})
	//存到数据库
	advert.save((err,result)=>{
		//如果存入数据库时出错，则停止向下执行，并跳到下一中间件
		if(err){
			return next(err)
		}
		//存入成功时响应一个json
		res.json({
			err_code:0
		})
	})
})

//用来查询数据库中所有广告的中间件
router.get('/advert/list',(req,res,next)=>{
	//查询Advert模型对象中的所有数据
	Advert.find((err,docs)=>{
		if(err){
			return next(err)
		}
		res.json({
			err_code:0,
			result:docs //响应查询到的数据
		})
	})
})

//用来查询数据库中某一条广告的中间件（advertId匹配到的内容作为参数）
router.get('/advert/one/:advertId',(req,res,next)=>{
	console.log(req.params)//req.params是一个对象，它有一个属性名为advertId，属性值为匹配到的参数
	//根据匹配到的参数req.params.advertId去数据库查询记录
	Advert.findById(req.params.advertId,(err,result)=>{
		if(err){
			return next(err)
		}
		res.json({
			err_code:0,
			result:result
		})
	})
})

//用来修改数据库中某一条广告的中间件
router.post('/advert/edit',(req,res,next)=>{
	//先根据id在数据库中找到这条广告
	Advert.findById(req.body.id,(err,advert)=>{
		if(err){
			return next(err)
		}
		//修改该条广告的数据
		const body = req.body
		advert.title = body.title
		advert.image = body.image
		advert.link = body.link
		advert.start_time = body.start_time
		advert.end_time = body.end_time
		advert.last_modified = Date.now()
		//将修改后的该条广告存入数据库（这里不会向数据库中新增记录，因为advert是通过id查出来的，有id属性，此处save()会覆盖该id对应的记录）
		advert.save((err,result)=>{
			if(err){
				return next(err)
			}
			res.json({
				err_code:0
			})
		})
	})
})

//用来删除数据库中某一条广告的中间件
router.get('/advert/remove/:advertId',(req,res,next)=>{
	//删除_id为req.params.advertId的广告记录
	Advert.remove({_id:req.params.advertId},err=>{
		if(err){
			return next(err)
		}
		res.json({
			err_code:0
		})
	})
})

//暴露该路由容器
export default router