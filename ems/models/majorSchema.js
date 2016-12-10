const mongoose=require('mongoose');
//设置时区，默认为格林威治时间
process.env.TZ = "Asia/Shanghai";
//申明一个mongoose对象
var MajorSchema=new mongoose.Schema({
    majorId:String,//专业Id
	facultyId:String,
	facultyName:String,

    departmentID:String,// 系ID-->作为外键和限制
	departmentName:String,//系名称

	magorName:String,


	dlt:{type:Number,default:0},
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}
},
	{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});

//每次执行都会调用，时间更新操作
MajorSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});


//暴露抛出去的方法
module.exports=MajorSchema;

