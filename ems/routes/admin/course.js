const PageInfo=require('../page');
const CourseInfo=require('../../modules/course');
const FacultyInfo=require('../../modules/faculty');
const utils=require('../util');

module.exports=function(app){
    //进入课程管理界面
    app.get('/admin_course/getCourse',function(req,res){
        res.render('admin/course/courseInfo',{msg:''})
    });
    //查询课程信息
    app.post('/admin_course/getCourseInfo',function(req,res){
        var type=req.body.type;
		var name=req.body.name;
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
		PageInfo.getPages(req, query, CourseInfo,res);
    });
    /**新建课程信息页面 */
    app.get('/admin_course/addCourse',function(req,res){
        FacultyInfo.find({dlt:0},function(err,data){
            res.render('admin/course/addCourse',{data:data});
        })
    });
    /** 新建课程信息 */
    app.post('/admin_course/doAddCourse',function(req,res){
        const query=utils.getAllPostForm(req);
        CourseInfo.create(query,function(err,data){
            if(err) throw err;
            res.render('admin/course/courseInfo',{msg:'增加课程成功'})
        })
    });
    /**删除课程信息 */
    app.post('/admin_course/deleteCourse',function(req,res){
        const query={
            _id:req.body.id,
            dlt:0
        }
        const updates={
            dlt:1,
            updateAt:Date.now()
        }
        CourseInfo.update(query,{$set:updates},function(err,data){
            if(err) throw err;
            if(data.ok==1){
                res.send({msg:'success'});
            }else{
                res.send({msg:'error'});
            }
        })
    });
    /**进入修改课程信息页面 */
    app.get('/admin_course/modifyCourseInfo/:id',function(req,res){
        const query={
            _id:req.params.id,
            dlt:0
        }
        CourseInfo.findOne(query,function(err,course){
            FacultyInfo.find({dlt:0},function(err,faculty){
                res.render('admin/course/modifyCourse',{course:course,faculty:faculty});
            })
        })
    });
    /**修改课程信息 */
    app.post('/admin_course/doModifyCourse',function(req,res){
        const query={_id:req.body.id,dlt:0}
        const updates={
            courseName:req.body.courseName,
            type:req.body.type,
            facultyName:req.body.facultyName,
            courseNumber:req.body.courseNumber,
            updateAt:Date.now()
        }
        CourseInfo.update(query,{$set:updates},function(err,data){
            if(err) throw err;
            if(data.nModified>=1){
                res.render('admin/course/courseInfo',{msg:'修改信息成功'});
            }
        })

    })
}