const mongoose=require('mongoose');
const EventInfoSchema=require('../models/eventSchema');
const EventInfo=mongoose.model('event',EventInfoSchema);
module.exports=EventInfo;