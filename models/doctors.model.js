const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    PMC: Number,
    qualification: String,
    phonenumber: Number,
    gender: String,
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;