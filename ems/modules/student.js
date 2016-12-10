const mongoose=require('mongoose');

const StudentSchema=require('../models/studentSchema');

const Students=mongoose.model('students',StudentSchema);

module.exports=Students;