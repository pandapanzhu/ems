const Faculty=require('../../modules/faculty');
const Major=require('../../modules/major');
const crypto=require('crypto');
const Present=require('../../modules/present');
const utils=require('../util');
const PageInfo=require('../page');
const Classroom=require('../../modules/classroom');


module.exports=function(app){
    //进入校长输入密码界面
    app.get('/admin_present/newFaculty/:msg',function(req,res){
        const msg=req.params.msg;
        res.render('admin/present/newFaculty',{msg:msg});
    });
    //直接进入学院信息管理页面
    app.get('/admin_present/getFacultyInfo',function(req,res){
        res.render('admin/present/facultyInfo');
    });

    //校长输入密码并判断正确之后，进入院系的详情页相应的页面
    app.post('/admin_present/present',function(req,res){
        //密码验证
        const passwords=req.body.psw;
        const md5password=crypto.createHash('md5');
        const present_password=md5password.update(passwords).digest('hex')
        console.log(present_password);
        const query={
            presentPassword:present_password
        }
        Present.count(query,function(err,data){
            if(err) throw err;
            //如果密码匹配就跳转到相应的页面，如果不匹配就返回json格式
            if(data==1){
                res.send({'msg':'success'});
            }else{
                res.send({'msg':'error'});
            }
        })
    });

    //增加学院信息
    app.post('/admin_present/doAddFaculty',function(req,res){
        const name=req.body.facultyName;
        //添加前的重复校验
        Faculty.count({facultyName:name},function(err,data){
            if(data==0){
                  Faculty.create({facultyName:name},function(err,data){
                       if(err) throw err;
                       res.send({msg:'success'});
                    });
                }else{
                    res.send({msg:'error'});
                }
            });//end faculty count
    });//end 

    //显示学院的基本信息,异步操作
    app.post('/admin_present/doGetFacultyInfo',function(req,res){
        //搜索条件
        var name=req.body.name;
        var type=req.body.type;
		//默认查询出所有的信息
		var query={dlt:0}
		//条件查询
		if(name!=''){
			//进行一次正则，表示模糊查询
			name=new RegExp(name);
			query={
				dlt:0,
				[type]:name
		}
		}//end if
		PageInfo.getPages(req, query, Faculty,function(err,data){
            res.send(data);
        });
    });

    //删除学院,异步操作
    app.post('/admin_present/deleteFaculty',function(req,res){
        const id=req.body.id;
        const query={
                _id:id,
                dlt:0
            }
        //删除并更新时间
        const updates={
            dlt:1,
            updateAt:Date.now()
        }
        //执行删除
        Faculty.update(query,{$set:updates},function(err,data){
            if(data.nModified>=1){
                res.send({msg:'success'});
            }else{
                res.send({msg:'error'})
            }
        })
    });//end delete

    //进入专业界面
    app.get('/admin_present/queryMajor/:id',function(req,res){
        const id=req.params.id;
        Faculty.findOne({_id:id,dlt:0},function(err,data){
            res.render('admin/present/majorInfo',{faculty:data})
        })
        
    });

    //查看专业信息,异步传输
    app.post('/admin_present/doGetMajorInfo',function(req,res){
        //查询条件
		var name=req.body.name;
        const facultyId=req.body.facultyId;

		var query={
            dlt:0,
            facultyId:facultyId
        }
		//条件查询
		if(name!=''){
			//进行一次正则，表示模糊查询
			name=new RegExp(name);
			query={
				dlt:0,
				majorName:name,
                facultyName:facultyName
		    }
		}//end if
	    PageInfo.getPages(req,query, Major,function(err,data){
            res.send(data);
        });

    });

    /**
     * 添加专业信息
     */
    app.post('/admin_present/doAddMajor',function(req,res){
        const query=utils.getAllPostForm(req);
        if(query.majorName==''){
            res.send({msg:'error'});
        }
        Major.create(query,function(err,data){
            if(err) throw err;
            res.send({msg:'success'})
        });
    });

    /**
     * 删除专业信息
     */
    app.post('/admin_present/deleteMajor',function(req,res){
        const _id=req.body.id;
        const query={
            _id:_id,
            dlt:0
        }
        const updates={
            dlt:1
        }
        Major.update(query,{$set:updates},function(err,data){
            if(err) throw err;
            if(data.nModified>0){
                res.send({msg:'success'});
            }else  res.send({msg:'error'});
           
        })
    });//end delete


    /**
     * ============================学院信息操作完毕======================
     * 
     * ============================开始对教室信息进行操作================
     */

    /**
     * 进入到教室管理界面
     */
    app.get("/admin_present/getClassroomInfo",function(req,res){
        res.render("admin/present/classroomInfo",{msg:""});
    });

    //异步获取教室信息，并进行分页
    app.post("/admin_present/doGetClassRoomInfo",function(req,res){
        //获取前台传过来的信息
        var type=req.body.type;
        var name=req.body.name;
        //定义查询类
       var query={ dlt:0 }
		//条件查询
		if(name!='' && type!='building'){
			//进行一次正则，表示模糊查询
			name=new RegExp(name);
			query={
				dlt:0,
				[type]:name
		    }
		}else if(name!='' && type=='building'){
            query={
				dlt:0,
				building:name
		    }
        }
	PageInfo.getPages(req,query, Classroom,function(err,data){
            res.send(data);
        });
    });

    //进入添加教室信息页面
    app.get("/admin_present/addClassRoom",function(req,res){
        res.render("admin/present/addClassroom");
    });

    //添加教师，同步操作
    app.post("/admin_present/doAddClassRoom",function(req,res){
        const query=utils.getAllPostForm(req);
        query.classroomName=req.body.building+"-"+req.body.classroomName;
        
        Classroom.create(query,function(err,data){
            if(err) throw err;
            res.render('admin/present/classroomInfo',{msg:'添加成功'})
        });
    });

    //删除教室信息
    app.post("/admin_present/deleteClassRoom",function(req,res){
        var id=req.body.id;
         const query={
               _id:id
            }
        //删除并更新时间
        const updates={
            dlt:1,
            updateAt:Date.now()
        }
        //执行删除
        Classroom.update(query,{$set:updates},function(err,data){
            if(data.nModified>=1){
                res.send({msg:'success'});
            }else{
                res.send({msg:'error'})
            }
        })

    })


}
