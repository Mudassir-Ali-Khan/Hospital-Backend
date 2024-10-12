const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctors.model');
const hash512 = require('../utils/hash');


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

        if (!email || !email.includes('@doctor.com')) {
            res.status(400);
            throw new Error("Email must be a valid address ending with @doctor.com");
        }

        const newDoctor = new Doctor({
            firstname,
            lastname,
            email,
            password: hash512(password),
            PMC,
            qualification,
            phonenumber,
            gender,
            isActive: false
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
        const { page = 1, limit = 10, search = '', status = '', dateFilter = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // dateFilter = '2022-12-31,2023-01-01';

        const searchQuery = {};

        if (search.trim() !== '') {
            searchQuery.$or = [
                { firstname: { $regex: search, $options: 'i' } },
                { lastname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { pmc: { $regex: search, $options: 'i' } },
                { qualification: { $regex: search, $options: 'i' } },
                { gender: { $regex: search, $options: 'i' } },
                // { phonenumber: { $regex: search, $options: 'i' } },
            ];
        }

        if (dateFilter) {
            console.log("dateFilter", dateFilter);
            const [startDate, endDate] = dateFilter.split(',');
            console.log(startDate, endDate)
            searchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        
        if (status && status !== "All") {
            searchQuery.gender = status;
        }
        

        const doctors = await Doctor.find(searchQuery)
            .select('-password') 
            .sort({ _id: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        
        const totalRecords = await Doctor.countDocuments(searchQuery);

        res.status(200).json({ data: doctors, meta: { totalRecords } });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
});

router.get('/:doctorId', async (req,res) => {
    try {
        const doctorId = req.params.doctorId;
        const doctor = await Doctor.findById(doctorId).select('-password');
        if (doctor) {
            res.status(200).json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
})


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
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
        
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}); 

router.patch('/updatepassword', async (req,res) => {
    try {
        const doctorId = req.body.doctorId;
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        
        

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const hashedPassword = hash512(password);
        console.log(hashedPassword.toString());
        const doctor = await Doctor.findById(doctorId);
        console.log("hello", doctor)
        if (!doctor || String(doctor.password) != hashedPassword.toString()) {
             return res.status(400).json({ message: 'Incorrect old password' });
        }
        if (password == newPassword) {
            return res.status(400).json({message: 'old password can not be same as new password'})
        }
        const hashedNewPassword = hash512(newPassword);

        const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, { password: hashedNewPassword.toString() },);

        if (updatedDoctor) {
            res.status(200).json({ message: 'Doctor updated successfully' });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
})

module.exports = router;