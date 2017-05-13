var mongoose=require('mongoose');
//接收到model层抛出来的方法
var AdminSchema=require('../models/adminSchema');

//Admins -->mongodb中的collection,AdminSchema-->对应的model层
var Admins=mongoose.model('Admins', AdminSchema);

//抛出方法，让router得到
module.exports=Admins;

