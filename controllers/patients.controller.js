const express = require('express');
const router = express.Router();
const Patient = require('../models/patients.model');
const hash512 = require('../utils/hash');


router.post('/', async function (req, res) {
    try {
        const { firstname, lastname, email, password, phonenumber, gender } = req.body;

        if (!firstname || !lastname || !email || !password || !phonenumber || !gender) {
            res.status(400);
            throw new Error("Please enter all fields");
        }

        const patient = await Patient.findOne({ email: email });

        if (patient !== null) {
            res.status(400);
            throw new Error("Patient already exists");
        }


        if (!email || !email.includes('@patient.com')) {
            res.status(400);
            throw new Error("Email must be a valid address ending with @patient.com");
        }

        const newPatient = new Patient({
            firstname,
            lastname,
            email,
            password: hash512(password),
            phonenumber,
            gender
        });

        await newPatient.save()

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
        

        const patients = await Patient.find(searchQuery)
            .select('-password') 
            .sort({ _id: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        
        const totalRecords = await Patient.countDocuments(searchQuery);

        res.status(200).json({ data: patients, meta: { totalRecords } });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
});

router.get('/:patientId', async (req,res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId).select('-password');
        if (patient) {
            res.status(200).json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
})


router.delete('/', async (req, res) => {
    const patientId = req.body.patientId;

    const result = await Patient.findByIdAndDelete(patientId);

    if (result) {
        res.status(200).json({ message: 'Patient deleted successfully' });
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const patientId = req.params.id; 
        const updatePatients = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phonenumber: req.body.phonenumber,
            gender: req.body.gender
        }

        const updatedPatients = await Patient.findByIdAndUpdate(patientId, updatePatients);

        if (updatedPatients) {
            res.status(200).json({ message: 'Patient updated successfully' });
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

router.patch('/updatepassword', async (req,res) => {
    try {
        const patientId = req.body.patientId;
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        
        

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const hashedPassword = hash512(password);
        console.log(hashedPassword.toString());
        const patient = await Patient.findById(patientId);
        console.log("hello", patient)
        if (!patient || String(patient.password) != hashedPassword.toString()) {
             return res.status(400).json({ message: 'Incorrect old password' });
        }
        if (password == newPassword) {
            return res.status(400).json({message: 'old password can not be same as new password'})
        }
        const hashedNewPassword = hash512(newPassword);

        const updatedPatient = await Patient.findByIdAndUpdate(patientId, { password: hashedNewPassword.toString() },);

        if (updatedPatient) {
            res.status(200).json({ message: 'Patient updated successfully' });
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
})

router.get('/api/patients', async function (req, res) {
    try {
        
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// router.patch('/updatepassword', async (req,res) => {
//     try {
//         const PatientEmail = req.body.email;
//         const updatePassword = {
//           oldPassword: req.body.oldPassword,
//           newPassword: req.body.newPassword,
//           confirmPassword: req.body.confirmPassword,
//         }
        
//         const updatedPassword = await Patient.findOneAndUpdate(PatientEmail, updatePassword)

        // if (newPassword !== confirmPassword) {
        //     res.status(400).json({ message: 'Passwords do not match' });
        //     return;
        // }
        // if (patient.password !== hash512(oldPassword)) {
        //     res.status(400).json({ message: 'Incorrect old password' });
        //     return;
        // }
        // if (newPassword == hash512(oldPassword)){
        //     res.status(400).json({message: 'New password matches old'})
        // }

//         if (updatedPassword) {
//             res.status(200).json({ message: 'Password updated successfully' });
//         } 
//     } catch (error) {
//         res.status(500).json({ message: 'An error occurred', error: error.message });
//     }
// }); 


module.exports = router;