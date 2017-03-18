const mongoose=require('mongoose');

const PerformanceSchema=require('../models/performanceSchema');

const Performance=mongoose.model('performance',PerformanceSchema);

module.exports=Performance;