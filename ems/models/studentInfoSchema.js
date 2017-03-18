const mongoose=require('mongoose');

process.env.TZ = "Asia/Shanghai";

const StudentInfoShema=new mongoose.Schema({
	studentId:String,//学号
	IdCard:String,//身份证
	phoneNo:String,//电话
	name:String,//姓名
	usedname:String,//曾用名
	gender:String,//性别
	birthday:String,//出生年月
	originSchool:String,//来源高中
	politicalLandscape:String,//政治面貌
	fatherName:String,//父亲姓名
	fatherPhone:String,//父亲电话
	motherName:String,//母亲姓名
	motherPhone:String,//母亲电话
	familyAddress:String,//家庭住址
	postCode:{type:String,default:0},//邮编
	ticketNo:String,//准考证号
	education:String,//学历

	faculty:String,//所属学院
	gradeId:String,//年级
	major:String,//专业
	classId:String,//班级
	
	candidateNo:String,//考生号
	studyYear:String,//学制
	studentPhoto:String,//存储照片的地址

	e_mail:String,//邮箱
	national:String,//民族

	
	remark:{type:String,default:""},//备注
	dlt:{type:Number,default:0},//是否删除，默认为0 ,0为不删除
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()}

},{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	})


//每次执行save方法都会调用，时间更新操作
StudentInfoShema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});

module.exports=StudentInfoShema;