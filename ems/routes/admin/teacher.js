const Teacher=require('../../modules/teacher');
const TeacherInfo=require('../../modules/teacherInfo');
const Faculty=require('../../modules/faculty');
const crypto=require('crypto');
const utils=require('../util');
const fs=require('fs');
const PageInfo=require('../page')

module.exports=function(app){
    //进入到显示列表信息的页面
    app.get('/admin_teacher/getTeacher',function(req,res){
        res.render('admin/teacher/teacherInfo');
    })

    // 显示所有老师的列表信息异步加载
	app.post('/admin_teacher/getTeacherInfo',function(req,res){
		//查询条件
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
		PageInfo.getPages(req,query,TeacherInfo,function(err,data){
            res.send(data);
        });
	});

    //进入添加教师信息
    app.get('/admin_teacher/addTeacher',function(req,res){
		Faculty.find({dlt:0},function(err,data){
			if(err) throw err;
			 res.render('admin/teacher/addTeacher',{faculty:data});
		})
       
    });
	//添加教师基本信息
	app.post('/admin_teacher/doAddTeacher',function(req,res,next){
		const md5=crypto.createHash('md5');
		password=md5.update(req.body.IdCard).digest('hex');
		const teacher={
			username:req.body.teacherId,
			password:password,
			name:req.body.name
		}
		Teacher.create(teacher,function(err,data){
			if(err) throw err;
		});
		next();
	});
    //添加教师详细信息
    app.post('/admin_teacher/doAddTeacher',function(req,res){
		var teacherid=req.body.teacherId;
		var query=utils.getAllPostForm(req);
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
	query.teacherPhoto=filename;
	}
		TeacherInfo.create(query,function(err,data){
			if(err) throw err;
			 res.redirect('/admin_teacher/showTeacherDetail/'+_id);
		})
	});
	
//显示详细信息
app.get('/admin_teacher/showTeacherDetail/:id',function(req,res){
	const teacherId=req.params.id;//职工号
	const query={_id:teacherId};
	TeacherInfo.findOne(query,function(err,data){
		if(err) throw err;
		res.render("admin/teacher/showTeacherDetail",{
			teacherInfo:data,
			message:''
		});
	});
});

//进入修改页面
app.get('/admin_teacher/modifyTeacherInfo/:id',function(req,res){
	const teacherId=req.params.id;
	const query={
		_id:teacherId
	}
	TeacherInfo.findOne(query,function(err,data){
		if(err)throw err;
		res.render('admin/teacher/modifyTeacherInfo',{
			teacherInfo:data
		})
	})
});
//修改教师详细信息
app.post('/admin_teacher/doModifyTeacherInfo',function(req,res){
	var teacherid=req.body.teacherId;
	//查询条件
	const query={
		teacherId:teacherid,
		dlt:0
	}
	//得到表单中的更新的数据
	const updates=utils.getAllPostForm(req);

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
			TeacherInfo.find(query,function(err,data){
			res.render('admin/teacher/showTeacherDetail',{
				teacherInfo:data,
				message:'修改成功！'
			})
		})
	})
});//修改完成

//删除教师信息-->软删除
app.get('/admin_teacher/deleteTeacherInfo/:id',function(req,res){
	const teacherId=req.params.id;
	const query={
		teacherId:teacherId,
		dlt:0
	}
	const updates={
		dlt:1,
		updateAt:new Date()
	}
	TeacherInfo.update(query,{$set:updates},function(err,data){
		if (err) throw err;
		res.redirect('/admin_teacher/getTeacher');
	})
});

/**
 * 重置密码
 */
app.post('/admin_teacher/initPass',function(req,res){
	const md5=crypto.createHash('md5');
	var id=req.body.id;
	var query={
		username:id,
		dlt:0
	}
	var password=md5.update(id).digest('hex');
	Teacher.update(query,{$set:{password:password,updateAt:Date.now()}},function(err,data){
		if(err) throw err;
		if(data.nModified>0){
			res.send({msg:'success'});
		}else{
			res.send({msg:'error'});
		}
	})

})

}
