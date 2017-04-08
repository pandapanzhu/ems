/**
 * 个人信息的管理
 */

const Student=require('../../modules/student');
const StudentInfo=require('../../modules/studentInfo');
const Performance=require('../../modules/performance');
const Test=require('../../modules/test');
const util=require('../util');
const EventInfo=require('../../modules/event');
const Registration=require('../../modules/registration');



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
		var limits={}
		//var user=req.session.user.username.substring(0,4);
		StudentInfo.findOne({studentId:req.session.user.username},function(err,student){
			if(err) throw err;
			var grade=student.gradeId;//查询出学生的年级,活动限制了年级，所以需要排除
			EventInfo.find(query,function(err,data){//得到了未删除的活动
				//将所有活动进行遍历，在活动中遍历后，再遍历是否为限制条件，如果为限制条件，则添加一个字段
				for(var i in data){
					var limit=data[i].limitation.split(",");
					for(var j in limit){//限制遍历
						if(grade==limit[j]){//确认为限制年级
							limits[i]="1";//1代表被限制
							continue;//循环结束
						}else{
							limits[i]="0";//0代表未被限制
						}
					}

				}
				sendData.limitation=limits
				sendData.list=data;
				res.send(sendData);
			})
		})
	});

	/**
	 * 学生活动报名流程
	 */
	app.post('/student_person/registEvent',function(req,res){
		var id=req.body.id;//活动Id
		var studentId=req.session.user.username;
		var query={
			eventId:id,
			studentId:studentId,
			dlt:0
		}
		Registration.findOne(query,function(err,data){
			if (err) throw err;
			if(data){
				res.send({'msg':'error'});//查询出来，证明数据库存在，已经报名过了
			}else{
				Registration.create(query,function(err,data1){//如果注册成功，则表明报名成功了~
					if(err) throw err;
					res.send({'msg':'success'});
				})
			}
		});// end findOne
	})// end function


	/**
	 * 学生进入自己的活动页面
	 */
	app.get('/student_person/showMyEvent',function(req,res){		
		var studentId=req.session.user.username;
		var query={
			studentId:studentId,
			dlt:0
		}
		Registration.find(query,function(err,data){
			if(err) throw err;
			if(data.length!=0){//找到已经注册的活动了，但是需要对活动Id进行解析
				res.render('student/showMyEvent',{'msg':'success',data:data});
			}else{
				res.render('student/showMyEvent',{'msg':'error',data:''});
			}
		});
	});
	
	/**
	 * 根据活动的Id,查询活动的信息
	 */
	app.post('/student_person/getEventById',function(req,res){
		var id=req.body.id;
		var query={
			_id:id,
			dlt:0
		}
		EventInfo.findOne(query,function(err,data){
			if(err) throw err;
			if(data!=null){
				res.send({list:data});
			}else{
				res.send({list:''})//
			}
		})
	});

	/**
	 * 进入查看自己的课表的页面
	 */
	app.get('/student_person/showMyArrangement',function(req,res){
		res.render('student/showMyArrangement')
	});
	/**
	 * 查看课表详情js
	 */
	app.post('/student_person/doShowMyArrangement',function(req,res){
		var user= req.session.user;
        var username=user.username;
	})
	 

}
