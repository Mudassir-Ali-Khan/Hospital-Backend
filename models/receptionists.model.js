const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    phonenumber: Number,
    gender: String,
});

const Receptionist = mongoose.model('Receptionist', receptionistSchema);

module.exports = Receptionist;