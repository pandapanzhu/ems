const mongoose=require('mongoose');

process.env.TZ='Asia/Shanghai';

//活动信息表
const eventSchema=new mongoose.Schema({
    eventName:String,
    startTime:String,//起始时间
    endTime:String,//结束时间
    // studentNumber:Number,//学生人数
    limitation:String,//限制信息
	// eventType:String,//类型

    remark:{type:String,default:""},//备注
	dlt:{type:Number,default:0},//是否删除，默认为0 ,0为不删除
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}
},{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});
    //每次执行save方法都会调用，时间更新操作
eventSchema.pre('save',function(next){
	if(this.isNew){
		thiscreateAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});
module.exports=eventSchema;
