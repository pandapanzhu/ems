//node.js自带的md5加密技术
var crypto=require('crypto');
//设置上传插件
var formidable=require('formidable');
var fs=require('fs');
var ArrangeMent=require('../modules/arrangement');

//取出__proto__字段
module.exports.getAllPostForm=function (req){
	const postForm=req.body;
		//拼凑字符串，减少一个字符‘__proto__’
		//先将json对象遍历出来，减少一个字符串后，压入数组中
		const strr=[];
		const s1='{';
		for(var i in postForm){
			if(i=="__proto__"){
				continue;
			}
			strr.push(i+':"'+postForm[i]+'"');
		}
		const s2='}';
		//将数组转换成字符串
		var strrString=strr.join();
		//拼接字符串
		const ss=s1+strrString+s2;
		//减少一个字段后，重新转化为json格式
		var ssJson=eval('('+ss+')');
		return ssJson;

};

module.exports.setFormidable=function(req,res,next){
	//创建表单
	var form=new formidable.IncomingForm();
	//设置编辑
	form.encoding='utf-8';
	//保存文件的路径
	form.uploadDir='/uploads/images/';
	//是否保留后缀
	form.keepExtensions=true;
	//设置单个上传文件的大小
	form.maxFieldsSize=2*1024*1024	//2M

	form.parse(req,function(err,fields,files){

		if (err) throw err;
		//设置后缀名
		var extName = '';  //后缀名
        switch (files.studentphoto.type) {
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
		var studentid=req.body.studentId;
	var filename=studentid+'.'+extName;
	var newPath=form.uploadDir+filename;
	fs.renameSync(files.studentphoto.path,newPath);//

	});
	next();

}
/**
 * ===================排课部分=====================
 */

/**
 * 解决教室的问题
 */
module.exports.RecursionForArrangeRoom=function(query,classroom,callback){
	var i=Math.floor(Math.random()*classroom.length);//取一个随机数,因为0的关系，所以需要向下取整
	query.classRoomId=classroom[i]._id
	ArrangeMent.findOne(query,function(err,data){
		if(data){
			RecursionForArrangement(query);
		}else{
			callback("选择教室时失败",query);//返回一个query
		}
	})
}

/**
 * 排课中，解决时间的问题
 */
module.exports.RecursionForArrangeTime=function(query,time,callback){
	var i=Math.floor(Math.random()*4);//取一个随机数,因为0的关系，所以需要向下取整
	var j=Math.floor(Math.random()*4);//取一个随机数,因为0的关系，所以需要向下取整
	var times=time[i][j];
	query.times=times;
	ArrangeMent.findOne(query,function(err,data){
		if(data){
			RecursionForArrangeTime(query);
		}else{
			callback("选择教室时失败",query);//返回一个query
		}
	})
}

/**
 * ==============排课部分结束==============
 */

//登录管理
module.exports.loginController=function(req,res){

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



