/**
 * 成绩管理
 */
const Performance=require('../../modules/performance');
const Course=require('../../modules/course');
const Classes=require('../../modules/classInfo');
const Student=require('../../modules/studentInfo');
const utils=require('../util');
const PageInfo=require('../page');
const async=require('async');
module.exports=function(app){
    /**
     * 进入显示成绩页面
     * */
    app.get('/admin_performance/showPerformance',function(req,res){
        res.render('admin/performance/performanceInfo',{msg:''});
    });

    /**
     * 异步加载考生的成绩数据
     */
    app.post('/admin_performance/doGetPerformance',function(req,res){
        var ret=[];
        var type=req.body.type;
        var name=req.body.name;
        var query={
            dlt:0
        }
        var send={}
        //条件查询
		if(name!=''){
			//进行一次正则，表示模糊查询
			name=new RegExp(name);
			query={
				dlt:0,
				[type]:name
			}
		}//end if
	
    //当前页，每页数量，选择类型、名称
	//page,size 初始时得到的不是数字，需要*1，将其转化为数字
	var page=req.body.pageNum *1;
	var size=req.body.pageSize *1;
	var isFirstPage;
	var isLastPage;

	const MongoDbs=Performance.find(query);
        
	MongoDbs.sort({'updateAt':-1});
	MongoDbs.skip((page-1)*size);

	MongoDbs.limit(size);
   

	MongoDbs.exec(function(err,data){
		if (err) throw err;
		//data为当前页的数据
       
		//再查询一次页面,计算出查询到的数据总量-->result
		Performance.count(query,function(err,result){
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

    app.post('/admin_performance/getStudentNameByStudentId',function(req,res){
        var id=req.body.studentId;
        Student.findOne({_id:id},function(err,data){
            if (err) throw err;
            res.send({studentName:data.name});
        })
    });
    app.post('/admin_performance/getCourseByCourseId',function(req,res){
        var id=req.body.courseId;
        Course.findOne({_id:id},function(err,data){
            if(err) throw err;
            res.send(data);
        })
    })

    /**
     * 进入添加学生成绩的页面，将班级信息和课程信息先行传过去
     */
    app.get('/admin_performance/addPerformance',function(req,res){
        var query={}
        Course.find({dlt:0},function(err,data0){//课程信息
            if(err) throw err;
            Classes.distinct('gradeId',{dlt:0},function(err,data1){//班级信息
                if(err)throw err;
                query.course=data0;
                query.classes=data1;
                res.render('admin/performance/addPerformance',query);
            });
        });
    });
    /**
     * 班级信息改变后，动态加载该班的学生信息
     */
    app.post('/admin_performance/getstudentInfo',function(req,res){
        const grade=req.body.grade;
        const major=req.body.major;
        const classid=req.body.classid;
        var query={
            gradeId:grade,
            major:major,
            classId:classid,
            dlt:0
        }
        Student.find(query,function(err,data){
            if(err) throw err;
            res.send(data);
        });

    })


    //添加学生成绩
    app.post('/admin_performance/doAddPerformance',function(req,res){
        const studentId=req.body.studentName;//得到学生的id;
        const courseId=req.body.courseName;//得到课程的id;
        const result=req.body.score;//分数
        //const scoreType=req.body.scoreType;//分数类型
       
        var year=new Date().getFullYear();
        var years=year+'-'+--year;//学年
        var month=new Date().getMonth()+1;
        var term=1;
        if(month<9&&3<month ){
            term=2;
        }
        var query={
            years:years,
            term:term,
            courseId:courseId,
            studentId:studentId,
            results:result
        }
        if(result<50){
            query.repair=1//重修
        }else if(result<60 &&result>=50){
            query.makeup=1//补考
        }else {
            query.point=(result-50)/10;//绩点
        }
        Performance.create(query,function(err,data){
            if(err) throw err;
            res.render('admin/performance/performanceInfo',{msg:'添加学生成绩成功'})
        })
    });

    /**
     * 删除考试成绩
     */
     app.post('/admin_performance/deletePerformance',function(req,res){
        var id=req.body.id;
        var query={_id:id,dlt:0};
        var updates={dlt:1,updateAt:Date.now()}
        Performance.update(query,{$set:updates},function(err,data){
            if(err) throw err;
            if(data.nModified>=1){
                res.send({msg:"success"});
            }else  res.send({msg:"error"});
        })
     });

    /**
     * 修改成绩这一个选项
     */
    app.post('/admin_performance/modifyResult',function(req,res){
        var id=req.body.hiId;
        var result=req.body.results;
        var updates={
            results:result,
            updateAt:Date.now()
        }
        if(result<50){
            updates.repair=1//重修
        }else if(result<60 &&result>=50){
            updates.makeup=1//补考
        }else {
            updates.point=(result-60)/10;//绩点
        }
        var query={
            _id:id,
            dlt:0
        }

        Performance.update(query,{$set:updates},function(err,data){
            if(err) throw err;
            res.render('admin/performance/performanceInfo',{msg:"修改成绩成功"});
        })
    })
}