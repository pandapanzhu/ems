const mongoose = require('mongoose');

const StudentInfoSchema=require('../models/studentInfoSchema');

const StudentInfo=mongoose.model('studentinfos',StudentInfoSchema);

module.exports=StudentInfo;