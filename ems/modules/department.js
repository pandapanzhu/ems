const mongoose = require('mongoose');

const DepartmentSchema=require('../models/departmentSchema');

const Departments=mongoose.model('department',DepartmentSchema);

module.exports=Departments;