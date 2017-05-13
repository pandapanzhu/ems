const mongoose=require('mongoose');
const TeacherSchema=require('../models/teacherSchema');
const Teachers=mongoose.model('teacher',TeacherSchema);
module.exports=Teachers;