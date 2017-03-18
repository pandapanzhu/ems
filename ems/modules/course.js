const mongoose=require('mongoose');

const courseSchema=require('../models/courseSchema');

const course=mongoose.model('course',courseSchema);

module.exports=course;