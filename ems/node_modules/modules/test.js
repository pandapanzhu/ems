const mongoose=require('mongoose');
const TestSchema=require('../models/testSchema');
const Test=mongoose.model('test',TestSchema);
module.exports=Test;