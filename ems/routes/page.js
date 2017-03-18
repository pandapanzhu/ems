//实现分页管理
const studentInfo=require('../modules/studentInfo')

module.exports.getPages = function (req, query,Mongos,res) {

	//当前页，每页数量，选择类型、名称
	//page,size 初始时得到的不是数字，需要*1，将其转化为数字
	var page=req.body.pageNum *1;
	var size=req.body.pageSize *1;
	var isFirstPage;
	var isLastPage;

	const MongoDbs=Mongos.find(query);
	MongoDbs.sort({'updateAt':-1});
	MongoDbs.skip((page-1)*size);

	MongoDbs.limit(size);
	MongoDbs.exec(function(err,data){
		if (err) throw err; 
		//data为当前页的数据

		//再查询一次页面,计算出查询到的数据总量-->result
		Mongos.count(query,function(err,result){
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

};