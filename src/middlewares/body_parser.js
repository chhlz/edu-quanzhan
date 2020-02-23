import queryString from 'querystring'

//处理post请求体中间件
export default (req,res,next)=>{
	//如果是get请求（get请求的请求头中没有'content-length'属性），则此处代码不再向后执行，而是进入下一个中间件
	if(!req.headers['content-length']){
		return next()
	}
	
	//如果是包括文件上传的表单请求，则不处理，交给第三方模块formidable处理
	if(req.headers['content-type'].startsWith('multipart/form-data')){
		return next()//不往后执行，进入下一个中间件
	}
	
	//如果是普通的表单请求（不包括文件上传），则自己处理
	let data = '' //用来接收请求体的所有数据
	//请求包含请求体（post请求才会包含请求体）时会触发data事件，在该事件中处理请求，chunk是请求时获取到的数据块，一次请求可能会获取多个数据块
	req.on('data',chunk=>{
		data += chunk
	})
	//数据接收完毕会触发end事件
	req.on('end',()=>{
		//使用node的核心模块queryString将data从字符串转成对象，将该对象挂载到req对象的body属性上，之后下一个进入的中间件路由容器就可以获取该对象
		req.body = queryString.parse(data)
		next()
	})
}