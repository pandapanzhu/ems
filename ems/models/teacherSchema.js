const mongoose=require('mongoose');
//设置时区，默认为格林威治时间
process.env.TZ = "Asia/Shanghai";
//教师登录信息表
const TeacherSchema=new mongoose.Schema({
username:String,
password:String,
role:{type:String,default:'teacher'},
name:String,
dlt:{type:Number,default:0},
remark:String,
createAt:{type:Date,default:Date.now()},
updateAt:{type:Date,default:Date.now()}	
},
	{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});

    //每次save(创建表单)执行都会调用，时间更新操作
TeacherSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});

module.exports=TeacherSchema;