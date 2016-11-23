const mongoose=require('mongoose');

const StudentSchema=require('../models/student');

const Students=mongoose.model('students',StudentSchema);

module.exports=Students;