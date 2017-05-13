var mongoose=require('mongoose');
//接收到model层抛出来的方法
var ArrangementSchema=require('../models/arrangementSchema');

//Arrangement -->mongodb中的collection,ArrangementSchema-->对应的model层
var Arrangement=mongoose.model('arrangement', ArrangementSchema);

//抛出方法，让router得到
module.exports=Arrangement;

