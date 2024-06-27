const express = require('express');
const router = express.Router();
const Admin = require('../models/admin.model');
const hash512 = require('../utils/hash');
const generateToken = require('../utils/jwt');

router.post('/', async function (req, res) {
    try {
        const { fullname, email, password } = req.body; // Destructuring the request body

        const admin = await Admin.findOne({ email: email });

        if (admin !== null) {
            res.status(400);
            throw new Error("Doctor already exists");
        }

        if (!fullname || !email || !password) {
            res.status(400);
            throw new Error("Please enter all fields");
        }

        if (!email || !email.includes('@admin.com')) {
            res.status(400);
            throw new Error("Email must be a valid address ending with @admin.com");
        }

        // const pass =  hash512(password);
        
        // console.log(pass.toString(), pass);

        const newAdmin = new Admin({
            fullname,
            email,
            password: hash512(password),
            isAdmin: true
        });

        newAdmin.save()

        res.status(201).send('Admin added successfully');
    } catch (error) {
        console.error('Error adding admin:', error);
        res.json({
            message: error.message
        });
    }
});


module.exports = router;
