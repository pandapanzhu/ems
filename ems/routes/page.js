//实现分页管理
const studentInfo=require('../modules/studentInfo')

module.exports.getPages = function (page, size, query, Mongos) {

		studentinfos=Mongos.find(query);
			studentinfos.sort({'meta.updateAt':-1});
			studentinfos.skip((page-1)*size);
			
			studentinfos.limit(size);

			studentinfos.exec(function(err,data){
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
		console.log(jsonArray);
		return jsonArray;
	})
			})
};