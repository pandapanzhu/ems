/**
 * 个人信息的管理
 */

//crypto是node.js中 让其生成散列值来加密密码
const crypto=require('crypto');
const Student=require('../../modules/student');
const StudentInfo=require('../../modules/studentInfo');
const Performance=require('../../modules/performance');
const Test=require('../../modules/test');
const util=require('../util');
const EventInfo=require('../../modules/event');



module.exports=function(app){
	//进入到显示信息页面
	app.get('/student_person/showMyDetail',function(req,res){
		var user= req.session.user;
        var username=user.username;
        StudentInfo.findOne({studentId:username,dlt:0},function(err,data){
            res.render('student/showMyDetail',{student:data,msg:''});
        });
	});

    /**
     * 在显示页面点击修改后
     */
    app.post('/student_person/ModifyMyDetail',function(req,res){
        var studentId=req.session.user.username;
        var updates=util.getAllPostForm(req);
        updates.updateAt=Date.now();
        StudentInfo.update({studentId:studentId},{$set:updates},function(err,data){
            if(err) throw err;
            if(data.nModified>0){
                res.send({msg:'success'});
            }else    res.send({msg:'error'});
        })
    });

	/**
	 * 根据学生Id,查出其年级
	 */
	app.post('/student_person/getMyYears',function(req,res){
		 var studentId=req.session.user.username;
		 StudentInfo.findOne({studentId:studentId},function(err,data){
			 if(err) throw err;
			 res.send({grade:data.gradeId});
		 })
	})

	/**
	 * 进入考试成绩查看页面
	 */
	app.get('/student_person/showMyPerformance',function(req,res){
		var studentId=req.session.user.username;
		StudentInfo.findOne({studentId:studentId},function(err,data){
			if(err) throw err;
			var id=data._id;
			res.render('student/showMyPerformance',{studentId:id});
		})
	});
	//异步加载查询条件等
	app.post('/student_person/doShowMyPerformance',function(req,res){
		var studentId=req.body.studentId;
		var year=req.body.year;
		var term=req.body.term;
		var query={studentId:studentId};
		if(year!=""){
			query.years=year;
		}
		if(term!=""){
			query.term=term;
		}
		Performance.find(query).sort({'updateAt':1}).exec(function(err,data){
			res.send({list:data});
		})
	});

	//查看个人考试信息
	app.get('/student_person/showMyTest',function(req,res){//查看自己的考试页面
		res.render('student/showMytest');
	});

	//异步加载，查看考试信息，分学年和学期显示考试信息
	app.post('/student_person/getMytest',function(req,res){
		var year=req.body.year;
		year=year.substring(5);
		//进行一次正则，表示模糊查询
		year=new RegExp(year);
		var query={
			dlt:0,
			starttime:year
		}
		var studentId=req.session.user.username;
		StudentInfo.findOne({studentId:studentId},function(err,data){
			if(err) throw err;
			//三个字段确定班级信息，确定必修课的考试信息
			query.grade=data.gradeId;
			query.major=data.major;
			query.classes=data.classId;

			Test.find(query,function(err,tests){
				if(err) throw err;
				res.send({test:tests});
			})
		})
	});

	//学生进入查看活动报名页面
	app.get('/student_person/showAllEvent',function(req,res){
		res.render('student/showAllEvent');
	});

	//异步加载查询条件等
	app.post('/student_person/getAllEvent',function(req,res){
		var year=req.body.year;
		year=year.substring(5);
		//进行一次正则，表示模糊查询
		year=new RegExp(year);
		var query={
			dlt:0,
			startTime:year
		}
		var sendData={}

		//var user=req.session.user.username.substring(0,4);
		StudentInfo.findOne({studentId:req.session.user.username},function(err,student){
			if(err) throw err;
			var grade=student.gradeId;
			EventInfo.find({dlt:0},function(err,data){
				sendData.list=data;
				
				res.send(sendData);
			})
		})
	});

}
