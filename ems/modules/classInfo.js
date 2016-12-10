const classInfoSchema=require('../models/classInfoSchema');
const mongoose=require('mongoose');
const classInfo=mongoose.model('classs',classInfoSchema);
module.exports=classInfo;