var mongoose=require('mongoose');
//接收到model层抛出来的方法
var FacultySchema=require('../models/facultySchema');

var Facultys=mongoose.model('facultys', FacultySchema);

//抛出方法，让router得到
module.exports=Facultys;

