const mongoose=require('mongoose');
const EventInfo=require('../../modules/event');
const utils=require('../util');
const PageInfo=require('../page');
const Registration=require('../../modules/registration');
const StudentInfo=require('../../modules/studentInfo');
const FacultyInfo=require('../../modules/faculty');
module.exports=function(app){
    /** 进入活动管理页面*/
    app.get('/admin_event/getEvent',function(req,res){
        res.render('admin/event/eventInfo',{msg:''});
    });
    /**加载活动的信息，实现分页 */
    app.post('/admin_event/getEventInfo',function(req,res){
        var name=req.body.name;
        var type=req.body.type;
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
		PageInfo.getPages(req, query, EventInfo,function(err,data){
            res.send(data);
        });
    });
    /**进入增加活动信息页面 */
    app.get('/admin_event/addEvent',function(req,res){
        res.render('admin/event/addEvent');
    });
    /**增加活动信息 */
    app.post('/admin_event/doAddEvent',function(req,res){
        const query=utils.getAllPostForm(req);
        EventInfo.create(query,function(err,data){
            if(err) throw err;
            res.render('admin/event/eventInfo',{msg:'添加活动信息成功'})
        })
    });
    /**删除活动信息 */
    app.post('/admin_event/deleteEvent',function(req,res){
        const id=req.body.id;
        EventInfo.update({_id:id,dlt:0},{$set:{dlt:1,updateAt:Date.now()}},function(err,data){
            if(err) throw err;
            if(data.nModified=1)res.send({msg:'success'});
            else res.send({msg:'error'});
        })
    });
    /**进入修改页面 */
    app.get('/admin_event/modifyEventInfo/:id',function(req,res){
        const id=req.params.id;
        EventInfo.findOne({_id:id,dlt:0},function(err,data){
            if(err) throw err;
            res.render('admin/event/modifyEvent',{data:data});
        })
    });
    /**修改活动信息 */
    app.post('/admin_event/doModifyEvent',function(req,res){
        const id=req.body.id;
        const query={
            _id:id,
            dlt:0
        }
        const updates={
            eventName:req.body.eventName,
            startTime:req.body.startTime,
            endTime:req.body.endTime,
            limitation:req.body.limitation,
            updateAt:Date.now()
        }
        
        EventInfo.update(query,{$set:updates},function(err,data){
            if(err) throw err;
            if(data.nModified==1)res.render('admin/event/eventInfo',{msg:'修改活动信息成功'})
        })
    });
    /**进入查看报名的学生页面 */
    app.get('/admin_event/showPersonOfEvent/:id',function(req,res){
        const id=req.params.id;
        res.render('admin/event/showStudentOfEvent',{EventId:id});
    });
    /**查看学生，分页 */
    app.post('/admin_event/getStudentOfEventInfo',function(req,res){
        var name=req.body.name;
        var type=req.body.type;
        var id=req.body.id;
        //默认查询出所有的信息
		var query={dlt:0,eventId:id}
		//条件查询
		if(name!=''){
			//进行一次正则，表示模糊查询
			name=new RegExp(name);
			query={
                eventId:id,
				dlt:0,
				[type]:name
			}
		}//end if
		PageInfo.getPages(req, query, Registration,function(err,data){
            res.send(data);
        });
    }); 
    /**
     * 根据学生的学号查询学生信息
     */
    app.post('/admin_event/getStudentByStudenIdt',function(req,res){
        var query=utils.getAllPostForm(req);
        StudentInfo.findOne(query,function(err,data){
            if(err) throw err;
            if(!data){
                res.send({'msg':'error'});
            }else{
                //因为学生查询出来的信息中，学院是学院id，所以这儿可以再根据学院的id，找到学院的名字。
                FacultyInfo.findOne({_id:data.faculty,dlt:0},function(err,result){
                    if(err) throw err;
                     res.send({list:data,myfaculty:result,'msg':'success'});
                })
               
            }
        })
    })
}