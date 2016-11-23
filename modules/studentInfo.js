const mongoose = require('mongoose');

const StudentInfoSchema=require('../models/studentInfo');

const StudentInfo=mongoose.model('studentinfos',StudentInfoSchema);

module.exports=StudentInfo;