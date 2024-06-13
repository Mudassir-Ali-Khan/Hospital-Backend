const express = require('express');
const router = express.Router();
const Patient = require('../models/patients.model');


router.post('/', async function (req, res) {
    try {
        const { firstname, lastname, email, password, phonenumber, gender } = req.body;

        if (!firstname || !lastname || !email || !password || !phonenumber || !gender) {
            res.status(400);
            throw new Error("Please enter all fields");
        }


        const newPatient = new Patient({
            firstname,
            lastname,
            email,
            password,
            phonenumber,
            gender
        });

        newPatient.save()

        res.status(201).send('Patient added successfully');
    } catch (error) {
        console.error('Error adding Patient:', error);
        res.json({
            message: error.message
        });
    }
});

router.get('/', async function (req, res) {
    try {
        const patients = await Patient.find() .sort({ _id: -1 });

        res.status(200).json(patients);
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.delete('/', async (req, res) => {
    const patientId = req.body.patientId;

    const result = await Patient.findByIdAndDelete(patientId);

    if (result) {
        res.status(200).json({ message: 'Patient deleted successfully' });
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
});

router.patch('/', async (req,res) => {
    try {
        const patientId = req.body.patientId;
        const updatePatients = {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          password: req.body.password,
          phonenumber: req.body.phonenumber,
          gender: req.body.gender
        }

        const updatedPatients = await Patient.findByIdAndUpdate(patientId, updatePatients)

        if (updatedPatients) {
            res.status(200).json({ message: 'Patient updated successfully' });
        }
        
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}); 

module.exports = router;