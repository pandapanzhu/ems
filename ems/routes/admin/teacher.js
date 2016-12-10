const teacher=require('../../modules/teacher');
const TeacherInfo=require('../../modules/teacherInfo');
const crypto=require('crypto');
const utils=require('../util');
const fs=require('fs');

module.exports=function(app){
    //进入到显示列表信息的页面
    app.get('/admin_teacher/getTeacher',function(req,res){
        res.render('admin/teacher/teacherInfo');
    })

    // 显示所有老师的列表信息异步加载
	app.post('/admin_teacher/getTeacherInfo',function(req,res){
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
		
		var teacherinfos=TeacherInfo.find(query);
			teacherinfos.sort({'meta.updateAt':-1});
			teacherinfos.skip((page-1)*size);
			teacherinfos.limit(size);
			//此处可用where语句来限定条件，也可以直接调用query
			/*if(query){
				studentinfos.where(query);
			}*/
			teacherinfos.exec(function(err,data){
				if (err) throw err; 
				//data为当前页的数据
				//计算查询到的数据总量
				TeacherInfo.find(query,function(err,result){
					if(page==1){
						isFirstPage=true;
					}
					else{
						isFirstPage=false;
					}
					//定义总页数，查询的条数除以每页的行数向上取整
					var totalPage=Math.ceil(result.length/size);
					//判断是否是最后一页
					if(page==totalPage){
						isLastPage=true;
					}else{
						isLastPage=false;
					}
					jsonArray={
						list:data,
						total:result.length,
						pages:result.length/size,
						pageSize:size,
						pageNum:page,
						isFirstPage:isFirstPage,
						isLastPage:isLastPage
					};
                res.send(jsonArray);
				})
			})
	});

    //进入添加教师信息
    app.get('/admin_teacher/addTeacher',function(req,res){
        res.render('admin/teacher/addTeacher');
    });
    //添加教师信息
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
			 res.redirect('/admin_teacher/showTeacherDetail/'+teacherid);
		})
	});
//显示详细信息
app.get('/admin_teacher/showTeacherDetail/:id',function(req,res){
	const teacherId=req.params.id;
	const query={teacherId:teacherId};
	TeacherInfo.find(query,function(err,data){
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
		teacherId:teacherId
	}
	TeacherInfo.find(query,function(err,data){
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

}
