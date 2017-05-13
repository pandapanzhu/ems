const mongoose=require('mongoose');
const TeacherInfoSchema=require('../models/teacherInfoSchema');
const teacherInfos=mongoose.model('teacherinfos',TeacherInfoSchema);
module.exports=teacherInfos;