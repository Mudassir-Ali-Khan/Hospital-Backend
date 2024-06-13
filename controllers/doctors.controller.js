const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctors.model');


router.post('/', async function (req, res) {
    try {
        const { firstname, lastname, email, password, PMC, qualification, phonenumber, gender } = req.body; // Destructuring the request body

        if (!firstname || !lastname || !email || !password || !PMC || !qualification || !phonenumber || !gender) {
            res.status(400);
            throw new Error("Please enter all fields");
        }

        const doctor = await Doctor.findOne({ PMC: PMC });

        if (doctor !== null) {
            res.status(400);
            throw new Error("Doctor already exists");
        }

        const newDoctor = new Doctor({
            firstname,
            lastname,
            email,
            password,
            PMC,
            qualification,
            phonenumber,
            gender
        });

        newDoctor.save()

        res.status(201).send('Doctor added successfully');
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.json({
            message: error.message
        });
    }
});

router.get('/', async function (req, res) {
    try {
        const doctors = await Doctor.find() .sort({ _id: -1 });

        res.status(200).json(doctors);
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.delete('/', async (req, res) => {
    const doctorId = req.body.doctorId;

    const result = await Doctor.findByIdAndDelete(doctorId);

    if (result) {
        res.status(200).json({ message: 'Doctor deleted successfully' });
    } else {
        res.status(404).json({ message: 'Doctor not found' });
    }
});

router.patch('/', async (req,res) => {
    try {
        const doctorId = req.body.doctorId;
        const updateDoctors = {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          password: req.body.password,
          PMC: req.body.PMC,
          qualification: req.body.qualification,
          phonenumber: req.body.phonenumber,
          gender: req.body.gender
        }

        const updatedDoctors = await Doctor.findByIdAndUpdate(doctorId, updateDoctors)

        if (updatedDoctors) {
            res.status(200).json({ message: 'Doctor updated successfully' });
        }
        
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}); 

module.exports = router;