const Faculty=require('../../modules/faculty');
const Department=require('../../modules/department');
const major=require('../../modules/major');
const crypto=require('crypto');
const Present=require('../../modules/present');


module.exports=function(app){
    //进入校长输入密码界面
    app.get('/admin_present/newFaculty',function(req,res){
        res.render('admin/present/newFaculty');
    });
    //直接进入facultyInfo
    app.get('/admin_present/getFacultyInfo',function(req,res){
        res.render('admin/present/facultyInfo');
    })

    //校长输入密码并判断正确之后，进入院系的详情页面
    app.post('/admin_present/present',function(req,res){
        const passwords=req.body.present_password;
        const md5password=crypto.createHash('md5');
        const present_password=md5password.update(req.body.present_password).digest('hex')
        console.log(present_password);
        const query={
            presentPassword:present_password
        }
        Present.count(query,function(err,data){
            if(err) throw err;
            //如果密码匹配就跳转到相应的页面，如果不匹配就返回json格式
            if(data==1){
                res.render('admin/present/facultyInfo');
            }else{
                res.send({'msg':'error'});
            }
        })
    });

    //进入增加院系信息页面
    app.get('/admin_present/addFaculty',function(req,res){
        res.render('admin/present/addFaculty')
    });

    //增加学院信息
    app.post('/admin_present/doAddFaculty',function(req,res){
        const type=req.body.type;
        const id=req.body.facultyId;
        const name=req.body.facultyName;
        //判断type类型，并添加到数据库
        if(type==''){
            res.send({'msg':'error'});
        }
        else if(type=="faculty"){
          var  query={
                facultyId:id,
                facultyName:name,
                type:type
            } 
        }else if(type=='department'){
            var query={
                departmentId:id,
                departmentName:name,
                type:type
                }
            }

            Faculty.count({facultyId:id},function(err,data){
                if(data==0){
                    Faculty.create(query,function(err,data){
                        if(err) throw err;
                        res.render('admin/present/facultyInfo',{msg:'添加成功'});
                    });
                }else{
                    res.send('ID重复');
                }
            });//end faculty count
});//end 

    //显示学院和系的基本信息
    app.post('/admin_present/doGetFacultyInfo',function(req,res){
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
        //定义一个json数组
        var jsonData={jsData:[]};
		//实现分页
		var facultys=Faculty.find(query);
			facultys.sort({'updateAt':-1});
			facultys.skip((page-1)*size);
			
			facultys.limit(size);

			facultys.exec(function(err,data){
                if(data.length!=0){
                    for(var i in data){
                        if(data[i].type=='department'){
                            datas={
                                id:data[i].departmentId,
                                name:data[i].departmentName,
                                type:'系'
                            }
                        }else if(data[i].type=='faculty'){
                            datas={
                                id:data[i].facultyId,
                                name:data[i].facultyName,
                                type:'学院'
                            }
                        }
                        //如果只定义个数组，可以用以下的方式赋值
                        // jsonData[i]=datas
                        jsonData.jsData.push(datas);

                    }
                }

				if (err) throw err; 
				//data为当前页的数据

				//再查询一次页面,计算出查询到的数据总量-->result
				Faculty.count(query,function(err,result){
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
						list:jsonData.jsData,
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

    //删除学院
    app.post('/admin_present/deleteFaculty',function(req,res){
        const id=req.body.id;
        const type=req.body.type;
        var query={};
        if(type=="系"){
            query={
                departmentId:id,
                dlt:0
            }
        }else if(type=="学院"){
            query={
                facultyId:id,
                dlt:0
            }
        }
        //删除并更新时间
        const updates={
            dlt:1,
            updateAt:Date.now()
        }
        Faculty.update(query,{$set:updates},function(err,data){
            res.send({msg:'success'});
        })

    })

}
