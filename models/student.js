const mongoose=require('mongoose');

//申明一个mongoose对象
var StudentSchema=new mongoose.Schema({
	username:String,
	password:String,
	name:String,
	role:{type:String,default:'student'},
	dlt:{type:Number,default:0},
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}
	
},
	{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});

//每次执行都会调用，时间更新操作
StudentSchema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});

StudentSchema.pre('update',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
})

//暴露抛出去的方法
module.exports=StudentSchema;

