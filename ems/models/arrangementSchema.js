/**
 * 排课的数据表
 * 
 */
const mongoose=require('mongoose');
//设置时区，默认为格林威治时间
process.env.TZ = "Asia/Shanghai";
//申明一个mongoose对象
var ArrangementSchema=new mongoose.Schema({
	teacherId:String,//教师信息
	courseId:String,//课程信息
	classId:String,//班级信息
	classRoomId:String,//教室信息
	years:String,//学年
	term:String,//学期
	times:Array,//上课时间
	dlt:{type:Number,default:0},
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}
},
	{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});

//每次执行都会调用，时间更新操作
ArrangementSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});


//暴露抛出去的方法
module.exports=ArrangementSchema;

