
/*
 * GET home page.
 */
//crypto是node.js中 让其生成散列值来加密密码
var crypto=require('crypto');
var Admins=require('../modules/admin');
const util=require('./util');


module.exports=function(app){
	app.get('/',function(req,res){
		res.render('login',{title:''});
	});

	app.get('/login',function(req,res){
		res.render('login',{title:''});
	});

	//登录处理
	
	app.post('/loginForm',function(req,res){
		if(req.body.role=="admin"){
			loginController(req,res);
		}
		
	});


	
	//登录管理
	function loginController(req,res){

		//password MD5加密
		var md5=crypto.createHash('md5');
		var password=md5.update(req.body.password).digest('hex');

		var query={username:req.body.username,password:password};
		var usernames={username:req.body.username}
		//检查该用户是否存在
		Admins.find(usernames,function(err,doc){
			if(err) throw err;
			if(doc.length==0){
				res.render('login',{
					title:'该用户不存在',
				});
			}
		})

		Admins.count(query,function(err,doc){
			if(doc==1){
				var findResult=Admins.find(query,function(err,result){
					//将登录信息存入session中
					req.session.user = result;
					if(err) {
						res.send(err);
					}else{
						res.render('index',{
							title:'登录成功,欢迎您',
							status: doc,
							username : query.username,
							result : result,
							date : new Date()
							
						});
					}
				});

			}else{
				res.render('login',{
					title:'密码错误，请重新输入',
					status:doc
				});
			}
		})
		
	}



	//注册用户处理
	app.post('/regForm',function(req,res){
		console.log(req.body.password);
		//将密码使用md5进行加密
		var md5=crypto.createHash('md5');
		password=md5.update(req.body.password).digest('hex');
		var query={username:req.body.username,password:password};


		Admins.create(query,function(err,data) {
			if (err){
				console.log(err);
			}else{
				console.log(data);
			}
		});
	})




}
