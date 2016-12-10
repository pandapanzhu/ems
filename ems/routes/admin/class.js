const crypto=require('crypto');
const classInfo=require('../../modules/classInfo');
const utils=require('../util');
const pages=require('../page');

module.exports=function(app){
    //进入查看班级页面
    app.get('/admin_class/getClass',function(req,res){
        res.render('admin/class/classInfo');
    });

    app.post('/admin_class/getClassInfo',function(req,res){
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
		const classInfos=classInfo.find(query);
		classInfos.sort({'meta.updateAt':-1});
		classInfos.skip((page-1)*size);
		classInfos.limit(size);
		classInfos.exec(function(err,data){
				if (err) throw err; 
				//data为当前页的数据
				//计算查询到的数据总量

				classInfo.count(query,function(err,result){
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

	//添加班级信息
	app.get('/admin_class/addClass',function(req,res){
		res.render('admin/class/addClass');

	})
}//end js