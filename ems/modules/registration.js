const mongoose=require('mongoose');
const RegistrationSchema=require('../models/registrationSchema');
const Registrations=mongoose.model('registration',RegistrationSchema);
module.exports=Registrations;