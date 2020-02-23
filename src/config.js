import {join} from 'path'

export default {
	viewPath: join(__dirname,'../views'),
	node_modules_path: join(__dirname,'../node_modules'),
	public_path: join(__dirname,'../public'),
	uploadDir: join(__dirname,'../public/uploads'),//设置上传文件存放的路径，__dirname指当前文件（config.js）的路径，'../public/uploads'是相对于它的路径
}
