
const ClassInfo=require('../../modules/classInfo');
const utils=require('../util');
const PageInfo=require('../page');
const Faculty=require('../../modules/faculty');
const Major=require('../../modules/major');
const TeacherInfo=require('../../modules/teacherInfo');
const StudentInfo=require('../../modules/studentInfo');

module.exports=function(app){
    //进入查看班级页面
    app.get('/admin_class/getClass',function(req,res){
        res.render('admin/class/classInfo');
    });

    app.post('/admin_class/getClassInfo',function(req,res){
		var type=req.body.type;
		var name=req.body.name;
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
		PageInfo.getPages(req, query, ClassInfo,function(err,data){
			res.send(data);
		});
    });

	/**
	 *进入添加班级信息页面
	 */
	app.get('/admin_class/addClass',function(req,res){
 		res.render('admin/class/addClass');
	});

	/**
	 * 添加页面进行异步传输，获取学院信息
	 */
	app.post('/admin_class/getFacultyInfo',function(req,res){
		Faculty.find({dlt:0},function(err,data){
			if(err) throw err;
			res.send(data);
		})
	});

	/**选择学院后，动态加载专业 */
	app.post('/admin_class/getMajorInfo',function(req,res){
		const facultyId=req.body.id;
		Major.find({facultyName:facultyId,dlt:0},function(err,data){
			res.send(data);
		})
	});

	/**加载老师信息 */
	app.post('/admin_class/getTeacherNames',function(req,res){
		TeacherInfo.find(function(err,data){
			if (err) throw err;
			res.send(data);
		})
	});

	/**
	 * 添加班级信息
	 */
	app.post('/admin_class/doAddClass',function(req,res){
		const faculty=req.body.facultyName;
		const major=req.body.majorName;
		const gradeName=req.body.gradeName;
		const query={
			facultyName:faculty,
			majorName:major,
			gradeId:gradeName
		}
		//查询现有学院、专业、年级已有的班级
		ClassInfo.count(query,function(err,result){
			var classId=result+1;
			query.classId=classId;
			query.studentNumber=req.body.studentNumber;
			query.teacherName=req.body.teacherName
			ClassInfo.create(query,function(err,data){
				if(err)throw err;
				if(data.length>0){
					res.render('admin/class/classInfo',{msg:'添加班级成功'});
				}
				else{
					res.render('admin/class/classInfo',{msg:'添加班级失败'});
				}
			})
		})//end count
	});
	/**
	 * 删除班级信息
	 */
	app.post('/admin_class/deleteClassInfo',function(req,res){
		const id=req.body.id;
		ClassInfo.update({_id:id},{$set:{dlt:1}},function(err,data){
			if(err) throw err;
			res.send({msg:'success'});
		})
	});

	/**进入修改班级页面 */
	app.get('/admin_class/modifyClassDetail/:id',function(req,res){
		const id=req.params.id;
		ClassInfo.findOne({_id:id},function(err,data){
			if (err) throw err;
			res.render('admin/class/modifyClass',{hiddenId:data._id,
				teacherName:data.teacherName,
				studentNumber:data.studentNumber
			});
		})
	});
	/**修改班级人数和班主任信息 */
	app.post('/admin_class/doModifyClass',function(req,res){
		const query={
			_id:req.body.hiddenId,
			dlt:0
		}
		const updates={
			studentNumber:req.body.studentNumber,
			teacherName:req.body.teacherName
		}
		ClassInfo.update(query,{$set:updates},function(err,data){
			if (err) throw err;
			res.render('admin/class/classInfo',{msg:'修改班级成功'})
		})
	});
	//查询该班学生信息
	app.get('/admin_class/showStudentInfoById/:id',function(req,res){
		const classId=req.params.id;
		const queryClass={
			_id:classId
		}
		ClassInfo.findOne(queryClass,function(err,data){
			if(err)throw err;
			const queryStudent={
				facultyName:data.facultyName,
				majorName:data.majorName,
				gradeId:data.gradeId,
				classId:data.classId
			}
			StudentInfo.find(queryStudent,function(err,result){
				console.log(result);
			})
			res.render('admin/class/studentInfoOfClass',{hiddenId:classId});
		})
		// StudentInfo.find(query,)
	})
}//end js