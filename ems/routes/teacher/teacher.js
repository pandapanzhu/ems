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
const CourseInfo=require('../../modules/course');
const Arrangement=require('../../modules/arrangement');//排课
const ClassInfo=require('../../modules/classInfo');
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
 * 进入我的学生信息的页面
 */
app.get('/teacher_control/MyStudentPerformance',function(req,res){
    res.render('teacher/showMyStudent');
});

/**
 * 应当先查询当前学期的课表，查询出班级信息，再查询出改班学生信息。再录入成绩
 */
app.post('/teacher_control/doShowMyStudent',function(req,res){
    var teacherId=req.session.user.username;
    var term=req.body.term;
    var years=req.body.years;
    var query={
        teacherId:teacherId,
        term:term,
        years:years,
        dlt:0
    }
    Arrangement.find(query,function(err,data){
        if(err) throw err;
        if(data.length>0){
            res.send({list:data,'msg':'success'});
        }else{
            res.send({'msg':'error'});
        }
    })
})
app.post('/teacher_control/getCourseById',function(req,res){
    CourseInfo.findOne({_id:req.body.course,dlt:0},function(err,data){
        if(err) throw err;
        if(!data){
            res.send({'msg':'error'});
        }else{
            res.send({course:data,'msg':'success'});
        }
    })
});
app.post('/teacher_control/getClassById',function(req,res){
    ClassInfo.findOne({_id:req.body.classId,dlt:0},function(err,data){
        if(err) throw err;
        if(!data){
            res.send({msg:'error'});
        }else{
            res.send({list:data,'msg':'success'})
        }
    })
});
//=================课程显示加载完成，现在更新成绩=============
/**
 * 录入成绩的显示页面
 */
app.get('/teacher_control/updatePerformance/:id',function(req,res){
    const id=req.params.id;
    Arrangement.findOne({_id:id,dlt:0},function(err,arrangement){
        if(err) throw err;
        if(!arrangement){
            res.render('teacher/updatePerformance',{'msg':'error'})
        }else{
            ClassInfo.findOne({_id:arrangement.classId,dlt:0},function(err,classes){
                if(err) throw err;
                if(!classes){
                    res.render('teacher/updatePerformance',{'msg':'error'})
                }else{
                    var classQuery={
                        faculty:classes.facultyName,
                        gradeId:classes.gradeId,
                        major:classes.majorName,
                        classId:classes.classId,
                        dlt:0
                    }
                    StudentInfo.find(classQuery).sort({'studentId':1}).exec(function(err,student){
                        if(err) throw err;
                        //如果添加了成绩的同学，将直接显示分数，不再具有输入框,所以需要
                        var performanceQuery={
                            years:arrangement.years,
                            term:arrangement.term,
                            courseId:arrangement.courseId,
                            dlt:0
                        }
                        Performance.find(performanceQuery,function(err,performance){
                            if(err) throw err;
                            res.render('teacher/updatePerformance',{
                                'msg':'success',
                                student:student,
                                arrangement:arrangement,
                                performance:performance
                            })
                        })
                        
                    })
                }
            })
        }
    })
});
/**
 * 录入成绩操作
 */
app.post('/teacher_control/doUpdatePerformance',function(req,res){
    var query=util.getAllPostForm(req);
    var result=query.results
    if(result<50){
            query.repair=1//重修
        }else if(result<60 &&result>=50){
            query.makeup=1//补考
        }else {
            query.point=(result-50)/10;//绩点
        }
        Performance.findOne(query,function(err,per){
            if(err) throw err;
            if(!per){//不存在本条信息
                Performance.create(query,function(err,data){
                    if(err) throw err;
                    res.send({msg:'success'})
                })
            }else{//存在本条信息
                res.send({msg:'success'})
            }
        })
        
})

/**
 * 教师查看自己的课表的页面
 */
app.get('/teacher_control/showMyArrangement',function(req,res){
    res.render('teacher/showMyArrangement');
});
/**
 * 查看课表的内容
 */
app.post('/teacher_control/doShowMyArrangement',function(req,res){
    var id=req.session.user.username;
    var teacherName=req.session.user.name;
    var years=req.body.years;
    var term=req.body.term;
    var query={
        teacherId:id,
        years:years,
        term:term,
        dlt:0
    }
    Arrangement.find(query,function(err,course){
        if(err) throw err;
        if(course.length==0){
            res.send({list:''})
        }else{
            res.send({
                list:course,
                title:{
                    years:req.body.years,
                    term:req.body.term,
                    teacherName:teacherName
                }
            });
        }
    })
})

}