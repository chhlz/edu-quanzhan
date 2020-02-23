import mongodb from 'mongodb'

const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/edu'

//全局错误处理中间件，用来将错误日志记录到数据库中
export default (errLog,req,res,next)=>{
	//连接到url指定的MongoDB数据库
	MongoClient.connect(url,(err,db)=>{
		//获取数据库'edu'中名为'error_logs'的集合（用于记录错误日志，没有则会创建），向其中插入一条数据
		db.db('edu')
			.collection('error_logs')
			.insertOne({
				name:errLog.name,
				message:errLog.message,
				stack:errLog.stack,
				time:new Date()
			},(err,result)=>{
				//响应给客户端json格式数据
				res.json({
					err_code:500,
					message:errLog.message
				})
			})
		db.close()
	})
}
