//活动报名表
const mongoose=require('mongoose');

const RegistrationSchema=mongoose.Schema({
    studentId:String,//报名学生id
    eventId:String,//报名活动id
	payment:{type:Number,default:0},//是否已支付报名费,1代表已支付，0代表未支付
    remark:{type:String,default:""},//备注
	dlt:{type:Number,default:0},//是否删除，默认为0 ,0为不删除
	createAt:{type:Date,default:Date.now()},//创建时间
	updateAt:{type:Date,default:Date.now()}

},{
	versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
});

RegistrationSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});
module.exports=RegistrationSchema;