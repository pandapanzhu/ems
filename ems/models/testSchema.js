const mongoose=require('mongoose');
//设置时区，默认为格林威治时间
process.env.TZ = "Asia/Shanghai";
//教师登录信息表
const TestSchema=new mongoose.Schema({
    
    testId:String,//选课课号
    courseId:String,//课程名称
    grade:String,//年级
    major:String,//专业
    classes:String,//考试班级
    starttime:String,//考试开始时间
    endtime:String,//考试结束时间
    address:String,//考试地点
    testtype:String,//考试类型：闭卷、开卷

    dlt:{type:Number,default:0},
    remark:String,//备注，备用
    createAt:{type:Date,default:Date.now()},
    updateAt:{type:Date,default:Date.now()}	
},
	{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});

    //每次save(创建表单)执行都会调用，时间更新操作
TestSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});

module.exports=TestSchema;