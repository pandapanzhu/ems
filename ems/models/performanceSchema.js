/**
 * 学生成绩实体类
 */
const mongoose=require('mongoose');
//设置时区，默认为格林威治时间
process.env.TZ = "Asia/Shanghai";
//申明一个mongoose对象
var PerformanceSchema=new mongoose.Schema({
	years:String,//学年
    term:Number,//学期
    courseId:String,//课程id,与course表关联
	studentId:String,//学生id,与学生表关联
    results:String,//成绩
    point:{type:String,default:0},//绩点，教师录入成绩后，在后台计算
    repair:{type:String,default:0},//重修标记,当成绩低于50分时，标示为1，
    repairPerformance:{type:String,default:''},//重修成绩，当重修成绩大于成绩的时候，将repair设置为0，
    makeup:{type:String,default:0},//补考标记，当分数50<results<60
    makeupPerformance:{type:String,default:''},//补考成绩，当补考成绩大于成绩的时候，将repair设置为0，
	dlt:{type:Number,default:0},
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}
},
	{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});

//每次执行都会调用，时间更新操作
PerformanceSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});


//暴露抛出去的方法
module.exports=PerformanceSchema;

