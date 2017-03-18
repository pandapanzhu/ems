
/*
 * GET home page.
 */
//crypto是node.js中 让其生成散列值来加密密码
const crypto=require('crypto');
const Admins=require('../modules/admin');
const Student=require('../modules/student');
const Teacher=require('../modules/teacher');
const util=require('./util');



module.exports=function(app){
	//页面初始化和退出处理
	app.get('/',function(req,res){
		req.session.user=null;//清楚session
		res.render('login',{title:''});
	});

	//登录处理
	app.post('/loginForm',function(req,res){
		//password MD5加密
		var md5=crypto.createHash('md5');
		var password=md5.update(req.body.password).digest('hex');
		var query={username:req.body.username,password:password};
		var role=req.body.role;
		if(role=="admin"){
			Admins.findOne(query,function(err,data){
				if(err) throw err;
				if(data==null){
					res.render('login',{title:'账户或密码错误！'});
				}else{
					req.session.user = data;
					res.render('index',{
							result : data,
							date : new Date()
						});
				}
			})
		}//end if admin-login
		else if(role=='student'){
			Student.findOne(query,function(err,data){
				if(err) throw err;
				if(data==null){
					res.render('login',{title:'账户或密码错误！'});
				}else{
					req.session.user = data;
					res.render('index',{
							result : data,
							date : new Date()
					});
				}
			})
		}//end if  student-login
		else if(role=='teacher'){
			Teacher.findOne(query,function(err,data){
				if(err) throw err;
				if(data==null){
					res.render('login',{title:'账户或密码错误！'});
				}else{
					req.session.user = data;
					res.render('index',{
							result : data,
							date : new Date()
					});
				}
			})
		}
	});
	

	//密码修改操作，异步
	app.post('/changePsw',function(req,res){
		var password=req.body.password;
		var newPas=req.body.newPassword;
		var confirm=req.body.confirmPassword;
		if(newPas!=confirm){
			res.send({msg:'repsw'});
		}else if(req.session.user==undefined){
			res.send({msg:'login'});
		}else{
		//将密码使用md5进行加密
		var md5=crypto.createHash('md5');
		password=md5.update(password).digest('hex');
		var query={username:req.session.user.username,password:password};
		var md5Hash=crypto.createHash('md5');
		newPassword=md5Hash.update(newPas).digest('hex');
		var role=req.session.user.role;
		var MongoDB=Admins;
		if(role=='student'){
			MongoDB=Student;
		}else if(role=='teacher'){
			MongoDB=Teacher;
		}
		//根据旧密码查找用户
		MongoDB.findOne(query,function(err,data) {
			if (err) throw err;
			if(data){//证明查找成功
				MongoDB.update(query,{$set:{password:newPassword}},function(err,data1){
					if (err) throw err;
					if(data1.nModified>0){
						res.send({msg:'success'})
					}else{
						res.send({msg:'error'})
					}
				})
			}else res.send({msg:'pswno'});
			
		});//end findOne
		}
	})

}
