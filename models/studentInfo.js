const mongoose=require('mongoose');

process.env.TZ = "Asia/Shanghai";

const StudentInfoShema=new mongoose.Schema({
	studentId:String,
	IdCard:String,
	phoneNo:String,
	name:String,
	usedname:String,
	gender:String,
	birthday:String,
	originSchool:String,
	politicalLandscape:String,
	familyName:String,
	familyPhone:String,
	familyAddress:String,
	postCode:{type:String,default:0},
	ticketNo:String,
	degreeLevel:String,
	department:String,
	gradeId:String,
	major:String,
	classId:String,
	candidateNo:String,//考生号
	studyYear:String,//学制
	studentPhoto:String,//存储照片的地址

	dlt:{type:Number,default:0},//是否删除，默认为0 ,0为不删除
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}
	
},{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	})


//每次执行save方法都会调用，时间更新操作
StudentInfoShema.pre('save',function(next){
	if(this.isNew){
		thiscreateAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});

StudentInfoShema.pre('update',function(next){
	if(this.isNew){
		thiscreateAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});



module.exports=StudentInfoShema;