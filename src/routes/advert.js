import express from 'express'
import mongodb from 'mongodb'//使用mongoose时不需要
import Advert from '../models/advert'
import formidable from 'formidable' //用于处理上传文件
import config from '../config'
import {basename} from 'path' //用于获取路径最后的文件名

//mongoDB原生写法，使用mongoose时不需要
//const MongoClient = mongodb.MongoClient
//const url = 'mongodb://localhost:27017/edu'

//创建路由容器，它可以挂载所有的路由中间件
const router = express.Router()


//制定所有的路由规则，它们都是挂载到路由容器上的路由中间件

//用来测试全局错误处理中间件
router.get('/aa',(req,res,next)=>{
	try{
		JSON.parse('{dsadsa')
	}catch(e){
		next(e)
	}
})

//配置路由
router.get('/advert',(req,res,next)=>{
	//查询数据库中广告模型对应的全部数据
//	Advert.find((err,adverts)=>{//如果不在第一个参数传要查询哪一条数据（此时应有3个参数），则第二个参数（此时只有2个参数）为查询到的全部数据的模型对象，它是一个对象组成的列表
//		if(err){
//			return next(err)
//		}
//		console.log(adverts)
//		res.render('advert_list.html',{//'/advert'对应跳转到advert_list.html页面
//			adverts//把adverts传给该页面，用于渲染
//		})
//	})
	
	//带分页的查询及渲染（每页5条）
	const page = Number.parseInt(req.query.page,10) //req.query.page接收请求本路由时以get方式传来的名为page的参数，10表示十进制
	const pageSize = 5
	Advert.find().skip((page-1)*pageSize).limit(pageSize).exec((err,adverts)=>{
		if(err){
			return next(err)
		}
		//查询出数据库中的总记录条数，并传给前端
		Advert.count((err,count)=>{
			if(err){
				return next(err)
			}
			//根据总记录条数和每页条数计算总页数
			const totalPage = Math.ceil(count/pageSize)
			res.render('advert_list.html',{
				adverts,//将查询出的分页数据传给页面advert_list.html
				totalPage, //将计算出的总页数传给页面
				page //将当前页码传给页面
			})
		})
		
	})
	
})

//配置路由
router.get('/advert/add',(req,res,next)=>{
	res.render('advert_add.html')//'/advert/add'对应跳转到advert_add.html页面
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
	//获取请求体（此处由于有文件上传，使用formidable来处理
//	const body = req.body;
	
	//使用formidable处理包含文件上传的表单提交
	const form = new formidable.IncomingForm();
	form.uploadDir = config.uploadDir //配置上传文件的存放路径（不配置则会被存放到formidable指定的一个系统临时文件目录）
	form.keepExtensions = true //保留上传文件的扩展名
	form.parse(req,(err,fields,files)=>{//fields是表单接收到的普通数据字段，files是文件上传的部分
		if(err){
			return next(err) //不再向后执行，而是进入下一个中间件，并将err传给下一个中间件
		}
		
		const body = fields//fields是表单中所有非上传文件的对象
		body.image = basename(files.image.path)//files是所有上传文件的对象，image是表单中上传文件对应的name，path是其在服务器上的完整路径
		
		
		//新建一个广告模型对象
		const advert = new Advert({
			title:body.title,
			image:body.image,
			link:body.link,
			start_time:body.start_time,
			end_time:body.end_time
		})
		console.log(advert);
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