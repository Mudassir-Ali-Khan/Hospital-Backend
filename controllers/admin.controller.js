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

router.patch('/updatepassword', async (req,res) => {
    try {
        const adminId = req.body.adminId;
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        
        

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const hashedPassword = hash512(password);
        console.log(hashedPassword.toString());
        const admin = await Admin.findById(adminId);
        console.log("hello", admin)
        if (!admin || String(admin.password) != hashedPassword.toString()) {
             return res.status(400).json({ message: 'Incorrect old password' });
        }
        if (password == newPassword) {
            return res.status(400).json({message: 'old password can not be same as new password'})
        }
        const hashedNewPassword = hash512(newPassword);

        const updatedAdmin = await Admin.findByIdAndUpdate(adminId, { password: hashedNewPassword.toString() },);

        if (updatedAdmin) {
            res.status(200).json({ message: 'Admin updated successfully' });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
})


module.exports = router;
