const mongoose=require('mongoose');
const PresentSchema=require('../models/presentSchema');
const Present=mongoose.model('present',PresentSchema);
module.exports=Present;