const express = require('express');
const router = express.Router();
const Receptionist = require('../models/receptionists.model');
const hash512 = require('../utils/hash');

router.post('/', async function (req, res) {
    try {
        const { firstname, lastname, email, password, phonenumber, gender } = req.body;

        if (!firstname || !lastname || !email || !password || !phonenumber || !gender) {
            res.status(400);
            throw new Error("Please enter all fields");
        }

        const receptionist = await Receptionist.findOne({ email: email });

        if (receptionist !== null) {
            res.status(400);
            throw new Error("Doctor already exists");
        }


        if (!email || !email.includes('@receptionist.com')) {
            res.status(400);
            throw new Error("Email must be a valid address ending with @receptionist.com");
        }

        const newReceptionist = new Receptionist({
            firstname,
            lastname,
            email,
            password: hash512(password),
            phonenumber,
            gender,
            isActive: false
        });

        newReceptionist.save()

        res.status(201).send('Receptionist added successfully');
    } catch (error) {
        console.error('Error adding Receptionist:', error);
        res.json({
            message: error.message
        });
    }
});

router.get('/', async function (req, res) {
    try {
        const Receptionists = await Receptionist.find() .sort({ _id: -1 });

        res.status(200).json(Receptionists);
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.delete('/', async (req, res) => {
    const receptionistId = req.body.receptionistId;

    const result = await Receptionist.findByIdAndDelete(receptionistId);

    if (result) {
        res.status(200).json({ message: 'Receptionist deleted successfully' });
    } else {
        res.status(404).json({ message: 'Receptionist not found' });
    }
});

router.patch('/', async (req,res) => {
    try {
        const receptionistId = req.body.receptionistId;
        const updateReceptionists = {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          password: req.body.password,
          phonenumber: req.body.phonenumber,
          gender: req.body.gender
        }

        const updatedReceptionists = await Receptionist.findByIdAndUpdate(receptionistId, updateReceptionists)

        if (updatedReceptionists) {
            res.status(200).json({ message: 'receptionist updated successfully' });
        } else {
            res.status(404).json({ message: 'Receptionist not found' });
        }
        
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}); 

router.patch('/updatepassword', async (req,res) => {
    try {
        const receptionistId = req.body.receptionistId;
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        
        

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const hashedPassword = hash512(password);
        console.log(hashedPassword.toString());
        const receptionist = await Receptionist.findById(receptionistId);
        console.log("hello", receptionist)
        if (!receptionist || String(receptionist.password) != hashedPassword.toString()) {
             return res.status(400).json({ message: 'Incorrect old password' });
        }
        if (password == newPassword) {
            return res.status(400).json({message: 'old password can not be same as new password'})
        }
        const hashedNewPassword = hash512(newPassword);

        const updatedreceptionist = await Receptionist.findByIdAndUpdate(receptionistId, { password: hashedNewPassword.toString() },);

        if (updatedreceptionist) {
            res.status(200).json({ message: 'receptionist updated successfully' });
        } else {
            res.status(404).json({ message: 'receptionist not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
})

module.exports = router;