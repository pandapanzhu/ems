
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
        var query={}
        //封装从前台传过来的信息
        var getData=req.body.data;
       var StringArray=getData.split("&");
       for(var i in StringArray){//循环第一次，将data中的信息拿出来
           var ArrayBy=StringArray[i].split("=");
           var name=ArrayBy[0],value=ArrayBy[1]
           query[name]=value;
       }

        query.courseId=req.body.sendData.course;
        query.teacherId=req.body.sendData.teacher;
        
        //装载排课信息
        var arrangements={
            years:query.years,
            term:query.term
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
            }else{
                 //查询出班级之后，将班级id装载到arrangements，
                arrangements.classId=classs._id;
                //调用函数解决时间问题，时间用周一到周五每天5节课的二维数组,先确定一个上课时间
                utils.RecursionForArrangeTime(arrangements,time,function(err,arrangeTime){
                    //添加教师信息
                    arrangeTime.teacherId=query.teacherId;
                    //让时间和教师做匹配，看时间和教师是否冲突，如果冲突，就在此更换时间
                    utils.checkTeacherAndTime(arrangeTime,function(err,teacherTime){
                        //然后再将course等信息装入arrangements
                        teacherTime.courseId=query.courseId;
                            ClassRoom.find({building:query.building,dlt:0},function(err,classroom){
                                if(err) throw err;
                                //解决教室问题==找到教室后，随机其一个数，然后在arrangement中查询，如果存在就递归，如果不存在就选择是它了
                                utils.RecursionForArrangeRoom(teacherTime,classroom,function(err,arrangeRoom){
                                    //arrangeRoom中已经选中教室了。
                                    Arrangement.create(arrangeRoom,function(err,add){
                                        if(err) throw err;
                                        res.send({'msg':'success'})
                                        if(add.length==0){
                                            res.send({'msg':'error'});
                                        }
                                    })//end create
                                })//end utilForRoom
                            })//end find ClassRoom
                        })//end teachertime
                    })//end utilForTime
            }//end else
        })//end ClassInfo find
    });//end function


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
    });

    /**
     * 进入到修改课程的界面
     */
    app.get('/admin_arrangement/modifyArrangement',function(req,res){
        ClassRoom.find({dlt:0},function(err,data){
            res.render('admin/arrangement/modifyArrangement',{'classroom':data});
        })
        
    });
    //获取排课的列表信息
    app.post('/admin_arrangement/getArrangementInfo',function(req,res){
        var query={
            dlt:0
        }
        var name=req.body.name;
        if(name!=''){//填写了搜索条件，输入了教师的名称
            query1={name:name,dlt:0}
            
            //去教师信息表中查询出教师的信息，讲其_id展示提出，作为搜索条件。
            Teacher.findOne(query1,function(err,myteacher){
                if(err) throw err;
                query.teacherId=myteacher.username;
                console.log(query);
                PageInfo.getPages(req,query,Arrangement,function(err,data){
                    if(err) throw err;
                    res.send(data);
                })
            })
            
        }else{
            PageInfo.getPages(req,query,Arrangement,function(err,data){
            if(err) throw err;
            res.send(data);
            })
        }
    });

    /**
     * 根据课程的Id，去查询课程的详细信息，并将其中的Id转换为中文信息，发送到前台
     */
    app.post('/admin_arrangement/getArrangementNameById',function(req,res){
        var id=req.body.myId;
        var sendData={};
        Arrangement.findOne({dlt:0,_id:id},function(err,myArrangement){
            if(err) throw err;
            //根据排课信息再查询出班级信息
            
            ClassInfo.findOne({dlt:0,_id:myArrangement.classId},function(err,myClasses){
                Faculty.findOne({dlt:0,_id:myClasses.facultyName},function(err,myfaculty){
                    //拼凑的班级信息
                    var myClassInfo=myfaculty.facultyName+myClasses.gradeId+myClasses.majorName+myClasses.classId+"班";
                    sendData.classes=myClassInfo;
                    CourseInfo.findOne({dlt:0,_id:myArrangement.courseId},function(err,mycourse){
                        if(err) throw err;
                        sendData.course=mycourse.courseName;
                        Teacher.findOne({dlt:0,username:myArrangement.teacherId},function(err,myteacher){
                            if(err) throw err;
                            sendData.teacher=myteacher.name;
                            ClassRoom.findOne({dlt:0,_id:myArrangement.classRoomId},function(err,myClassRoom){
                                if(err)throw err;
                                sendData.classroom=myClassRoom.classroomName;
                                //以下数据是为了填充模态框的数据
                                sendData.classRoomId=myClassRoom._id;
                                sendData.times=myArrangement.times;
                                sendData.years=myArrangement.years;
                                sendData.term=myArrangement.term;
                                sendData.teacherId=myArrangement.teacherId;
                                sendData.classId=myClasses._id;
                                //=============
                                res.send(sendData);
                            })
                        })
                    })
                })
            })

        })
    });//end 

    /**
     * 校验数据
     */
    app.post('/admin_arrangement/CheckForArrangement',function(req,res){
        
        var query={
            years:req.body.years,
            term:req.body.term,
            classRoomId:req.body.classroom,
            times:[req.body.times0*1,req.body.times1*1],
            dlt:0
            }
        //检查教室和时间是否冲突，
        Arrangement.find(query,function(err,data){
            if(err) throw err;
            if(data.length>0){
                res.send({'msg':1});
            }else{
                var query1={
                    years:req.body.years,
                    term:req.body.term,
                    teacherId:req.body.teacherid,
                    times:[req.body.times0*1,req.body.times1*1],
                    dlt:0
                }
                //检查教师和时间的冲突
                Arrangement.find(query1,function(err,teacher){
                    if(teacher.length>0){
                        res.send({'msg':2});
                    }else{
                        var query2={
                            years:req.body.years,
                            term:req.body.term,
                            classId:req.body.classId,
                            times:[req.body.times0*1,req.body.times1*1],
                            dlt:0
                        }
                        Arrangement.find(query2,function(err,classes){
                            if(classes.length>0){
                                res.send({'msg':3});
                            }else{
                                res.send({'msg':0})
                            }
                        });
                    }
                })
            }
        })
    });

    /**
     * 修改保存
     */
    app.post('/admin_arrangement/doModifyArrangement',function(req,res){
        var query={
            _id:req.body.id,
            dlt:0
        }
        var updates={
            times:[req.body.times0*1,req.body.times1*1],
            classRoomId:req.body.classroom,
            updateAt:Date.now()
        }
        Arrangement.update(query,{$set:updates},function(err,data){
            if (err) throw err;
			if(data.nModified>0){
				res.send({'msg':'success'})
			}else{
				res.send({'msg':'error'})
			}
        })
    })
}