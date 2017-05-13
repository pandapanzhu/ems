const classRoomSchema=require('../models/classRoomSchema');
const mongoose=require('mongoose');

const classroom=mongoose.model('classroom',classRoomSchema);

module.exports=classroom;