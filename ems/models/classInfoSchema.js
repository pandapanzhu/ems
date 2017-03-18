const mongoose=require('mongoose');

//设置时区，默认为格林威治时间
process.env.TZ = "Asia/Shanghai";

const classInfoSchema=new mongoose.Schema({
    facultyName:String,//学院
    majorName:String,//专业
    gradeId:String,//年级
    classId:String,//班级
    studentNumber:Number,//学生人数
    teacherName:String,//班主任姓名

	remark:{type:String,default:""},//备注
	dlt:{type:Number,default:0},//是否删除，默认为0 ,0为不删除
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}

},{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});

//每次执行save方法都会调用，时间更新操作
classInfoSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});

module.exports=classInfoSchema;