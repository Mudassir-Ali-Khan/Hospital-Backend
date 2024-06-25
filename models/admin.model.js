const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    isAdmin: Boolean,
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;