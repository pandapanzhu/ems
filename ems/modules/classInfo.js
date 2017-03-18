const classInfoSchema=require('../models/classInfoSchema');
const mongoose=require('mongoose');

const classInfo=mongoose.model('class',classInfoSchema);

module.exports=classInfo;