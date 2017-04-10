
const utils=require('../util');
const PageInfo=require('../page');
const Faculty=require('../../modules/faculty');
const Major=require('../../modules/major');
const TeacherInfo=require('../../modules/teacherInfo');
const StudentInfo=require('../../modules/studentInfo');
const CourseInfo=require('../../modules/course');
const ClassInfo=require('../../modules/classInfo');
const ClassRoom=require('../../modules/classroom');
const Teacher=require('../../modules/teacher');
const Arrangement=require('../../modules/arrangement');
const eventproxy = require('eventproxy');
module.exports=function(app){
    
    /**进入专业排课界面
     * 
     */
    app.get('/admin_arrangement/getArrangement',function(req,res){
        CourseInfo.find({dlt:0},function(err,course){//加载班级信息
            if(err) throw err;
            //加载教学楼信息
            ClassRoom.distinct('building',{dlt:0},function(err,building){
                TeacherInfo.find({dlt:0},function(err,teacher){
                    res.render("admin/arrangement/addArrangement",{
                        teacher:teacher,
                        course:course,
                        building:building
                    });
                })
            })
        })
    });
    /**排课算法 */
    app.post('/admin_arrangement/addArrangement',function(req,res){
        //生成上课的时间数组
        var time=new Array();
        for(var i=0;i<5;i++){//工作日
            time[i]=new Array();
            for(var j=0;j<5;j++){//第几节课
                time[i][j]=[i+1,j+1];
            }
        }
        var query=utils.getAllPostForm(req);//表单处理
        //装载排课信息
        var arrangements={
            years:query.years,
            term:query.term,
        }
        //查询班级信息
        var classes={}
        classes.facultyName=query.facultyName;
        classes.majorName=query.majorName;
        classes.gradeId=query.grade;
        classes.classId=query.classNames;
        ClassInfo.findOne(classes,function(err,classs){
            if(err) throw err;
            if(classs==null){
                res.send({'msg':'error'});//没有找到对应的班级
            }else{//查询出班级之后，将班级id装载到arrangements，然后再根据课程数量来分配教室。
                arrangements.classId=classs._id;
                    
                //根据课程的数量来循环
                var course=query.course.split(","),teacher=query.teacher.split(",");
                var ep=new eventproxy();
                ep.after('eventSuccess',course.length,function(data){
                    var msg='success',j=0;
                    for(var i in data){
                        if(data[i]==msg){
                            j++;
                        }
                    }
                    if(j==data.length){
                        res.send({'msg':'success'});
                    }
                });

                ep.after("eventError",1,function(data){
                    res.send({'msg':'error'})
                })
                
                course.forEach(function(item,i){
                    arrangements.courseId=course[i];
                    
                    //去重处理
                    Arrangement.findOne(arrangements,function(err,data){
                        if(err) throw err;
                        if(data){//证明数据库已经存在本条数据
                        ep.emit('eventError','error');//抛出异常
                        }else{
                            //添加教师信息
                            arrangements.teacherId=teacher[i];
                            //调用函数解决时间问题，时间用周一到周五每天5节课的二维数组
                            utils.RecursionForArrangeTime(arrangements,time,function(err,arrangeTime){
                                ClassRoom.find({building:query.building,dlt:0},function(err,classroom){
                                    if(err) throw err;
                                    //解决教室问题==找到教室后，随机其一个数，然后在arrangement中查询，如果存在就递归，如果不存在就选择是它了
                                    utils.RecursionForArrangeRoom(arrangeTime,classroom,function(err,arrangeRoom){
                                        //arrangeRoom中已经选中教室了。
                                        Arrangement.create(arrangeRoom,function(err,add){
                                            if(err) throw err;
                                                ep.emit('eventSuccess','success');
                                            if(add.length==0){
                                                ep.emit('eventError','error');
                                            }
                                        })//end create
                            })//end utilForRoom
                        })//end find
                })//end utilForTime
                        }
                })
                })//ed forEach

            }
        })
    })


    /**
     * 根据学院选择年级
     */
    app.post('/admin_arrangement/getGradeByFaculty',function(req,res){
        var id=req.body.id;
        var query={//查询信息，学院名称和删除判断
            facultyName:id,
            dlt:0
        }
        ClassInfo.distinct('gradeId',query,function(err,data){
            if(err) throw err;
            res.send({list:data});
        })
    });
    /**
     * 根据年级选择专业
     */
    app.post('/admin_arrangement/getMajorByGrade',function(req,res){
        var faculty=req.body.faculty;
        var grade=req.body.grade;
        var query={
            gradeId:grade,
            facultyName:faculty,
            dlt:0
        }
        ClassInfo.distinct('majorName',query,function(err,data){
            if(err) throw err;
            res.send({list:data});
        })
    });
    /**
     * 根据专业选择班级
     */
     app.post('/admin_arrangement/getClassByMajor',function(req,res){
        var faculty=req.body.faculty;
        var grade=req.body.grade;
        var major=req.body.major;
        
        var query={dlt:0}
        if(faculty!=""){
             query.facultyName=faculty
        }
        if(grade!=""){
            query.gradeId=grade
        }
        if(major!=""){
            query.majorName=major
        }
        ClassInfo.distinct('classId',query,function(err,data){
            if(err) throw err;
            res.send({list:data});
        })
    });

    /**
     * 进入显示课表信息页面
     */
    app.get('/admin_arrangement/showArrangementForClass',function(req,res){
        res.render('admin/arrangement/showArrangement');
    });
    /**
     * 显示课表信息
     */
    app.post('/admin_arrangement/doShowArrangement',function(req,res){
        var request=utils.getAllPostForm(req);
        var classes={dlt:0}
        classes.facultyName=req.body.facultyName;
        classes.majorName=req.body.majorName;
        classes.gradeId=req.body.grade;
        classes.classId=req.body.classNames;
       //查询出班级信息
       ClassInfo.findOne(classes,function(err,classs){
           if(err) throw err;
           if(classs){
            var query={
                classId:classs._id,
                years:req.body.years,
                term:req.body.term,
                dlt:0
            }
            Arrangement.find(query,function(err,data){
                if(err) throw err;
                Faculty.findOne({_id:req.body.facultyName,dlt:0},function(err,faculty){
                    request.facultyName=faculty.facultyName;
                     res.send({list:data,'msg':'',title:request});
                })
            });
           }else{
               res.send({'msg':'classes'});
           }
       })
    });
    /**
     * 根据各种Id,获取具体信息，并传向前台
     */
    app.post('/admin_arrangement/getNameById',function(req,res){
        var resData={}
        CourseInfo.findOne({_id:req.body.course,dlt:0},function(err,course){
            if(err) throw err;
            if(!course){
                res.send({'msg':'error'});
            }else{
                resData.course=course.courseName;
                TeacherInfo.findOne({teacherId:req.body.teacher,dlt:0},function(err,teacher){
                    if(err) throw err;
                    if(!teacher){
                        res.send({'msg':'error'});
                    }else{
                        resData.teacher=teacher.name;
                        ClassRoom.findOne({_id:req.body.classRoom,dlt:0},function(err,classroom){
                            if(err) throw err;
                            if(!classroom){
                                res.send({'msg':'error'});
                            }else{
                                resData.classroom=classroom.classroomName;
                                ClassInfo.findOne({_id:req.body.classId,dlt:0},function(err,classes){
                                    resData.classes=classes
                                    res.send({list:resData,'msg':''})
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}