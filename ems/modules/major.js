const mongoose=require('mongoose');

const MajorSchema=require('../models/majorSchema');

const Majors=mongoose.model('major',MajorSchema);

module.exports=Majors;