
/**
 * 考试管理
 * */

const Test=require('../../modules/test');
const Course=require('../../modules/course');
const Faculty=require('../../modules/faculty');
const Classes=require('../../modules/classInfo');
const classRoom=require('../../modules/classroom');
const utils=require('../util');
const PageInfo=require('../page');
module.exports=function(app){
    /**
     * 进入显示成绩页面
     * */
    app.get('/admin_test/showTest',function(req,res){
        res.render('admin/test/testInfo',{msg:''});
    });

    /**
     * 异步加载数据
     */
    app.post('/admin_test/doGetTestInfo',function(req,res){
        var type=req.body.type;
        var name=req.body.name;
        var query={
            dlt:0
        }
        if(type=='testClass'){//考试班级
            if(name!=''){
                if(name.length==1){
                    query.grade=name[0]
                }else if(name.length==2){
                    query.grade=name[0];
                    query.major=name[1];
                }else if(name.length==3){
                    query.grade=name[0];
                    query.major=name[1];
                    query.classes=name[2];
                }
            }
        }else if(type=='courseName'){//课程
            if(name!=''){
                //进行一次正则，表示模糊查询
                name=new RegExp(name);
                queries={
                    courseName:name,
                    dlt:0
                }
                Course.find(queries,function(err,courses){
                    if(err) throw err;
                    for(var i in courses){
                        var id=courses[i]._id;
                        query.courseId=id;
                    }
                    PageInfo.getPages(req, query, Test,function(err,data){
            res.send(data);
        });
                })
            }
        }//end else if
        else{
            //条件查询
            if(name!=''){
                //进行一次正则，表示模糊查询
                name=new RegExp(name);
                query={
                    dlt:0,
                    [type]:name
                }
            }//end if
        }
		PageInfo.getPages(req, query, Test,function(err,data){
            res.send(data);
        });
    });

    /**
     * 根据查询出来的CourseId,获取课程信息
     */
    app.post('/admin_test/getCourseById',function(req,res){
        var id=req.body.courseId;
        Course.findOne({_id:id},function(err,data){
            if(err) throw err;
            res.send(data);
        })
    });

    /**
     * 查询年级信息
     */
    app.post('/admin_test/getAllClasses',function(req,res){
         Classes.distinct('gradeId',{dlt:0},function(err,classes){
                if(err) throw err;
                res.send(classes);
         });
    })



    /**
     * 进入录入考试信息的页面，
     */
    app.get('/admin_test/addTest',function(req,res){
        var query={}
        Faculty.find({dlt:0},function(err,data){
            if(err) throw err;
            //去重查询
            Classes.distinct('gradeId',{dlt:0},function(err,classes){
                if(err) throw err;

                query.classes=classes;
                query.faculty=data;
                res.render('admin/test/addTest',query);
            })
        })
    });
    /**
     * 根据输入的信息，加载课程名
     */
    app.post('/admin_test/getCourseByFaculty',function(req,res){
        var name=req.body.name;
        var query={
            dlt:0,
            facultyName:name
        }
        Course.find(query,function(err,data){
            if(err) throw err;
            res.send(data);
        })
    });
    /**
     * 根据不同的年级，输出不同的专业
     */
    app.post('/admin_test/getMajorByGrade',function(req,res){
        var gradeId=req.body.gradeId;
        var query={
            gradeId:gradeId,
            dlt:0
        }
        Classes.distinct('majorName',query,function(err,data){
            if(err) throw err;
            res.send(data);
        })
    });
    /**
     * 根据年级和专业输出班级
     */
    app.post('/admin_test/getClassByMajor',function(req,res){
        var major=req.body.major;
        var gradeId=req.body.grade;
        var query={
            gradeId:gradeId,
            majorName:major,
            dlt:0
        }
        Classes.distinct('classId',query,function(err,data){
            if(err) throw err;
            res.send(data);
        })
    });

    /**
     * 根据教学楼选择教室
     */
    app.post('/admin_test/getClassroomByBuild',function(req,res){
        var building=req.body.building;
        classRoom.find({building:building,dlt:0},function(err,data){
            if(err) throw err;
            res.send(data);
        })
    });
    app.post('/admin_test/checkRoomAndTime',function(req,res){
        var starttime=req.body.starttime;
        var endtime=req.body.endtime;
        var room=req.body.classroom;
        Test.find({address:room},function(err,data){
            if(err) throw err;
            if(data.length>0){
                for(var i in data){
                    var start=data[i].starttime
                    var year=start.substring(0,4);
                    var month=start.substring(5,7);
                    var daya=start.subString(8,10);
                }
            res.send({msg:'error'});
            }else res.send({msg:'success'});
        })
    })

    //添加考试信息
    app.post('/admin_test/doAddTest',function(req,res){
        var query=utils.getAllPostForm(req);
        Test.create(query,function(err,data){
            if(err) throw err;
            res.render('admin/test/testInfo',{msg:'添加考试信息成功'})
        });
    });

    /**
     * 删除考试信息
     */
    app.post('/admin_test/deleteTest',function(req,res){
        var id=req.body.id;
        var query={
            _id:id,
            dlt:0
        }
        var updates={
            dlt:1
        }
        Test.update(query,{$set:updates},function(err,data){
            if(err) throw err;
            if(data.nModified>0) res.send({msg:'success'});
            else res.send({msg:'error'})
            
        })
    })

}