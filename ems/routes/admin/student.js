
const Students=require('../../modules/student');
const StudentInfo=require('../../modules/studentInfo');
const crypto=require('crypto');
const utils=require('../util');
const fs=require('fs');
const PageInfo=require('../page');

module.exports=function(app){
	//进入添加学生信息页面
	app.get('/admin_student/addStudent',function(req,res){
		res.render('admin/student/addStudent',{title:'新建学生信息'});
	});

	//添加学生基本信息
	app.post('/admin_student/doAddStudent',function(req,res,next){
		const md5=crypto.createHash('md5');
		password=md5.update(req.body.IdCard).digest('hex');
		const student={
					 username:req.body.studentId,
					 password:password,
					 name:req.body.name
					}
					Students.create(student,function(err,data){
					if(err) throw err;
					});
				next();
	});

	//添加学生详细信息
	app.post('/admin_student/doAddStudent',function(req,res){
		var photoname=req.files.studentphoto.name;

		if(photoname!=''){
		var newPath;
		var filename;
		var type=req.files.studentphoto.type;
		var path=req.files.studentphoto.path;
		
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

	var studentid=req.body.studentId;
	var studentName=req.body.name;
	var paths='public\\uploadimages\\students\\';
	//设置新的文件名
	filename=studentid+studentName+'.'+extName;
	//设置新的路径
	newPath=paths+filename;
	fs.renameSync(path,newPath);//重命名
	query.studentPhoto=filename;
	}

		var query=utils.getAllPostForm(req);
		
		StudentInfo.create(query,function(err,data){
			if(err) throw err;
			 res.redirect('/admin_student/showStudentDetail/'+req.body.studentId);
			//  res.render('admin/studentInfo',{title:'查询学生基本信息'});
		})
	});

	//跳向studentInfo这个页面
	app.get('/admin_student/studentInfo',function(req,res){
		res.render('admin/student/studentInfo',{
				title:'查询学生基本信息'
			})
	});

	//查询学生的基本信息，异步加载
	app.post('/admin_student/getStudentInfo',function(req,res){
		//CheckRole(req.session.user[0].role,'admin');
		//当前页，每页数量，选择类型、名称
		//page,size 初始时得到的不是数字，需要*1，将其转化为数字
		var page=req.body.pageNum *1;
		var size=req.body.pageSize *1;
		var name=req.body.name;
		var type=req.body.type;
		var isFirstPage;
		var isLastPage;
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
		
		var studentinfos=StudentInfo.find(query);
			studentinfos.sort({'meta.updateAt':-1});
			studentinfos.skip((page-1)*size);
			
			studentinfos.limit(size);

			studentinfos.exec(function(err,data){
				if (err) throw err; 
				//data为当前页的数据

				//再查询一次页面,计算出查询到的数据总量-->result
				StudentInfo.count(query,function(err,result){
					if(page==1){
						isFirstPage=true;
					}
					else{
						isFirstPage=false;
					}
					//定义总页数，查询的条数除以每页的行数向上取整
					var totalPage=Math.ceil(result/size);
					//判断是否是最后一页
					if(page==totalPage){
						isLastPage=true;
					}else{
						isLastPage=false;
					}
					jsonArray={
						list:data,
						total:result,
						pages:result/size,
						pageSize:size,
						pageNum:page,
						isFirstPage:isFirstPage,
						isLastPage:isLastPage
					};
                res.send(jsonArray);
				})

			})
	});


	//查询学生的详细信息
	app.get('/admin_student/showStudentDetail/:id',function(req,res){
		const studentId=req.params.id;
		const query={
			studentId:studentId,
			dlt:0
		};
		StudentInfo.find(query,function(err,data){
			res.render('admin/student/showStudentDetail',{
				studentInfo:data,
				message:''
			})
		})
	})


	//删除学生信息,软删除，删除后执行查询语句，返回所有的学生信息
	app.get('/admin_student/deleteStudentInfo/:studentInfoid',function(req,res){
		const studentId= req.params.studentInfoid;
		const query={
			studentId:studentId,
			dlt:0
		}
		const update={
			updateAt:Date.now(),
			dlt:1
		}
		StudentInfo.update(query,{$set:update},function(err,data){
			if (err) throw err;
			});

		StudentInfo.find({dlt:0}).sort({'meta.updateAt':-1}).exec(function(err,data){
			if (err) throw err;
			res.render('admin/student/studentInfo',{
				title:'查询学生基本信息',
				studentInfo:data,
				success:'删除成功'

			})
		})
	});

//进入修改学生信息页面
app.get('/admin_student/modifyStudentInfo/:studentInfoid',function(req,res){
	const studentInfoid=req.params.studentInfoid;
	query={
		studentId:studentInfoid
	};
	const studentInfo=StudentInfo.find(query,function(err,data){
		if (err) throw err;
		res.render('admin/student/modifyStudentInfo',{
		title:'修改学生信息',
		studentInfoid:studentInfoid,
		studentInfo:data
		});
	});
});

//修改学生信息
app.post('/admin_student/doModifyStudentInfo',function(req,res){
		var studentid=req.body.studentId;
		//查询条件
		const query={
		studentId:studentid,
		dlt:0
		}
		//去除表单中的_proto_属性
		var updates=utils.getAllPostForm(req);
		//获取图片的信息
		var photoname=req.files.studentphoto.name;
		if(photoname!=''){
		var newPath;
		var filename;
		var obj=req.files.studentphoto;
		var type=req.files.studentphoto.type;
		var path=req.files.studentphoto.path;
		
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

	var studentName=req.body.name;
	var paths='public\\uploadimages\\students\\';
	//设置新的文件名
	filename=studentid+studentName+'.'+extName;
	//设置新的路径
	newPath=paths+filename;
	fs.renameSync(path,newPath);//重命名
	updates.studentPhoto=filename;
	}
	updates.updateAt=new Date();
		StudentInfo.update(query,{$set:updates},function(err,data){
		if(err) throw err;
			StudentInfo.find(query,function(err,data){
			res.render('admin/student/showStudentDetail',{
				studentInfo:data,
				message:'修改成功！'
			})
		})
	})
});


}//end app
