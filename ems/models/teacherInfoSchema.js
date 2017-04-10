const mongoose=require('mongoose');

process.env.TZ='Asia/Shanghai';
//教师信息表
const TeacherInfoShema=new mongoose.Schema({
    teacherId:String,
    IdCard:String,
    name:String,
    gender:String,
    usedname:String,
    national:String,
    birthday:String,
    originSchool:String,//毕业院校
    politicalLandscape:String,//政治面貌
    faculty:String,//学院
    phoneNo:String,//电话号码
    e_mail:String,
    major:String,//主修方向
    degree:String,//学位
    education:String,//学历
    title:String,//职称
    office:String,//职务
    direction:String,//学科方向
    teacherNo:String,//教师资格证
    employeeNo:String,//人事职工号
    labMan:{type:Boolean,default:false},//是否是实验室人员
    teacherPhoto:{type:String},//照片

    remark:{type:String,default:""},//备注
	dlt:{type:Number,default:0},//是否删除，默认为0 ,0为不删除
	createAt:{type:Date,default:Date.now()},
	updateAt:{type:Date,default:Date.now()},
	
},{
		versionKey:false	//mongoose自动生成versionkey,设置为false可以防止其生成
	});

    //每次执行save方法都会调用，时间更新操作
TeacherInfoShema.pre('save',function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now();
	}else{
		this.updateAt=Date.now();
	}
	next();
});

module.exports=TeacherInfoShema;