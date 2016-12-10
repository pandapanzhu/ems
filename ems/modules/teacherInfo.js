const mongoose=require('mongoose');
const TeacherInfoShema=require('../models/teacherInfoSchema');
const teacherInfos=mongoose.model('teacherinfos',TeacherInfoShema);
module.exports=teacherInfos;