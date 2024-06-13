const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    phonenumber: Number,
    gender: String,
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;