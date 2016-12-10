const mongoose=require('mongoose');
const TeacherShema=require('../models/teacherSchema');
const Teachers=mongoose.model('teacher',TeacherShema);
module.exports=Teachers;