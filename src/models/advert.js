import mongoose from 'mongoose'

mongoose.connect('mongodb://localhost/edu')

//设计广告的数据库对象模型
const advertSchema = mongoose.Schema({
	title:{type:String,required:true},
	image: {type:String,required:true},//类型为String，且非空
	link:{type:String,required:true},
	start_time: {type:Date,required:true},
	end_time:{type:Date,required:true},
	create_time:{type:Date,default:Date.now},//默认值为当前时间
	last_modified:{type:Date,default:Date.now}
})

//创建模型，命名为'Advert'，并导出
export default mongoose.model('Advert',advertSchema)
