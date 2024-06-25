const express = require('express');
const router = express.Router();
const Admin = require('../models/admin.model');



router.post('/', async function (req, res) {
    try {
        const { fullname, email, password, isAdmin } = req.body; // Destructuring the request body

        if (!fullname || !email || !password || !isAdmin) {
            res.status(400);
            throw new Error("Please enter all fields");
        }

        if (!email || !email.includes('@admin.com')) {
            res.status(400);
            throw new Error("Email must be a valid address ending with @admin.com");
        }

        const newAdmin = new Admin({
            fullname,
            email,
            password,
            isAdmin
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
