const mongoose=require('mongoose');
const courseSchema=mongoose.Schema({
    courseName:String,//课程名
    type:String,//课程类型
    facultyName:String,//所属学院
    courseNumber:String,//学分 
	startweek:String,//开始周次
	endweek:String,//结束周次
	frequency:Number,//一周几次课时
    remark:{type:String,default:''},
    dlt:{type:Number,default:0},
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}

},{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
    });
courseSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});


//暴露抛出去的方法
module.exports=courseSchema;

