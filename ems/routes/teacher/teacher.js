/**
 * 教师操作后台
 */

const Student=require('../../modules/student');
const StudentInfo=require('../../modules/studentInfo');
const Performance=require('../../modules/performance');
const Test=require('../../modules/test');
const util=require('../util');
const EventInfo=require('../../modules/event');
const Registration=require('../../modules/registration');
const Teacher=require('../../modules/teacher');
const TeacherInfo=require('../../modules/teacherInfo');

const Arrangement=require('../../modules/arrangement');//排课

module.exports=function(app){
    //教师显示自己的详细信息
    app.get('/teacher_control/showMyInfo',function(req,res){
        var id=req.session.user.username;
        TeacherInfo.findOne({teacherId:id},function(err,data){
            if (err) throw err;
            res.render('teacher/showMyDetail',{
                teacher:data,
                msg:''
            });
        });
    });

    /**
     * 修改教师详细信息
     *
     */
app.post('/teacher_control/doModifyteacher',function(req,res){
	var teacherid=req.session.user.username;
	//查询条件
	const query={
		teacherId:teacherid,
		dlt:0
	}
	//得到表单中的更新的数据
	const updates=util.getAllPostForm(req);

	//获取图片中 的属性
    var photoname=req.files.teacherphoto.name;
	var newPath;
	if(photoname!=''){
	var type=req.files.teacherphoto.type;
	var path=req.files.teacherphoto.path;
		
	//设置后缀名
	var extName = '';  //后缀名
    switch (type) {
        case 'image/pjpeg':
            extName = 'jpg';
            break;
        case 'image/jpeg':
            extName = 'jpg';
            break;         
            case 'image/png':
            extName = 'png';
            break;
         case 'image/x-png':
            extName = 'png';
            break;         
        }

	var teacherName=req.body.name;
	var paths='public\\uploadimages\\teachers\\';
	//设置新的文件名
	filename=teacherid+teacherName+'.'+extName;
	//设置新的路径
	newPath=paths+filename;
	fs.renameSync(path,newPath);//重命名
	updates.teacherPhoto=filename;
	}//照片更新完成

	updates.updateAt=new Date();

	TeacherInfo.update(query,{$set:updates},function(err,data){
		if(err) throw err;
			TeacherInfo.findOne(query,function(err,data1){
                if(err) throw err;
                res.render('teacher/showMyDetail',{
                    teacher:data1,
                    msg:'修改信息成功~'
                })
		})
	})
});//修改完成

/**
 * 录入学生成绩页面
 */
app.get('/teacher_control/MyStudentPerformance',function(req,res){
    
})

}