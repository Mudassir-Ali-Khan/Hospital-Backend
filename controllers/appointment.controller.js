const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment.model');
const { default: mongoose } = require('mongoose');

router.get('/', async function (req, res) {
    try {
        const appointments = await Appointment.find().populate('patient', 'firstname lastname email').populate('doctor', 'firstname lastname email PMC');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message }); 
    }
});

router.post('/', async function (req, res) {
    try {
        // Destructing
        // '2024-10-12T11:41:15.943+00:00'
        const { appointmentDate, appointmentTime, fees, patientId, doctorId } = req.body;

        // console.log("appointmentDate", appointmentDate);
        const apptDate = new Date(appointmentDate);

        // console.log("apptDate", apptDate);
        const appointmentDay = apptDate.getDate();
        const appointmentMonth = apptDate.getMonth() + 1;
        const appointmentYear = apptDate.getFullYear();

        const patientAppointments = await Appointment.find({ patient: patientId });
        const allAppointments = await Appointment.find();
        // console.log("patientAppointments", patientAppointments);

        if (fees < 0) {
            return res.status(400).json({ message: 'Fees cannot be negative' });
        }

        // Check if there is an appointment on the same date and time by the same doctor and different patient
        allAppointments.forEach((appt) => {
            const apptDate = new Date(appt.appointmentDate);
            const apptDay = apptDate.getDate();
            const apptMonth = apptDate.getMonth() + 1;
            const apptYear = apptDate.getFullYear();
            if (apptDay == appointmentDay && apptMonth == appointmentMonth && apptYear == appointmentYear && appt.patient.toString() !== patientId && appt.doctor.toString() === doctorId && appt.appointmentTime === appointmentTime) {
                 res.status(400);
                 throw new Error('Some Patient has an appointment on this time');
            }
        });

        patientAppointments.forEach((appt) => {
            const apptDate = new Date(appt.appointmentDate);
            const apptDay = apptDate.getDate();
            const apptMonth = apptDate.getMonth() + 1;
            const apptYear = apptDate.getFullYear();

            // This validation checks that if the any of the patient appountment booked on the same date or not with same doctor
            if (apptDay == appointmentDay && apptMonth == appointmentMonth && apptYear == appointmentYear && appt.doctor.toString() === doctorId) {
                // return res.status(400).json({ message: 'Patient has an appointment on this day' });
                res.status(400);
                throw new Error('Patient has an appointment on this day with this doctor');
            }
            // This validation checks that if the any of the patient appountment booked on the same date and also on same time with another doctor
            if (apptDay == appointmentDay && apptMonth == appointmentMonth && apptYear == appointmentYear && appt.doctor.toString() !== doctorId && appt.appointmentTime === appointmentTime) {
                // return res.status(400).json({ message: 'You already have appointment on this time' });
                res.status(400);
                throw new Error('You already have appointment on this time');
            }
        });

        // Creating a new appointment
        const appointment = new Appointment({ appointmentDate: new Date(appointmentDate), appointmentTime, fees, patient: patientId, doctor: doctorId });
        const savedAppointment = await appointment.save();

        res.status(200).json({ message: 'Appointment created successfully' });
        
    } catch (error) {
        res.status(500);
        res.json({ message: error.message }); 
    }
});

router.patch('/status', async function (req, res) {
    try {
        const { appointmentId, status } = req.body;

        const validStatuses = ['pending', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ message: 'Appointment status updated successfully', appointment });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// This Api used to transfer the appointment to another doctor
router.patch('/doctor', async function (req, res) {
    try {
        const { appointmentId, newDoctorId } = req.body;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const apptDate = new Date(appointment.appointmentDate);
        const apptDay = apptDate.getDate();
        const apptMonth = apptDate.getMonth() + 1;
        const apptYear = apptDate.getFullYear();

        const doctorAppointments = await Appointment.find({ doctor: doctorId });

        doctorAppointments.forEach((doctorAppt) => {
            const DAptDate = new Date(doctorAppt.appointmentDate);
            const DApptDay = DAptDate.getDate();
            const DApptMonth = DAptDate.getMonth() + 1;
            const DApptYear = DAptDate.getFullYear();

            if (apptDay == DApptDay && apptMonth == DApptMonth && apptYear == DApptYear && doctorAppt.appointmentTime === appointment.appointmentTime && doctorAppt.doctor.toString() === newDoctorId && doctorAppt.appointmentStatus === 'pending') {
                res.status(400);
                throw new Error('This doctor has an appointment on this day');
            }
        });
        
        appointment.doctor = newDoctorId;
        await appointment.save();
        res.status(200).json({ message: 'Appointment doctor updated successfully', appointment });

    } catch (error) {
        res.json({ message: error.message }); 
    }
});

router.patch('/', async function (req, res) {
    try {
        const { appointmentId, patientId, doctorId, newAppointmentDate, newAppointmentTime } = req.body;

        const apptDate = new Date(newAppointmentDate);
        const appointmentDay = apptDate.getDate();
        const appointmentMonth = apptDate.getMonth() + 1;
        const appointmentYear = apptDate.getFullYear();

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const patientAppointments = await Appointment.find({patient: patientId, _id: {$not:{$eq: new mongoose.Types.ObjectId(appointmentId)}}});
        console.log(patientAppointments)
        const allAppointments = await Appointment.find();

        patientAppointments.forEach((appt) => {
            const apptDate = new Date(appt.appointmentDate);
            const apptDay = apptDate.getDate();
            const apptMonth = apptDate.getMonth() + 1;
            const apptYear = apptDate.getFullYear();

            if (apptDay == appointmentDay && apptMonth == appointmentMonth && apptYear == appointmentYear &&
                appt.doctor.toString() === doctorId) {
                return res.status(400).json({ message: 'Patient already has an appointment with this doctor on this day' });
            }

            if (apptDay == appointmentDay && apptMonth == appointmentMonth && apptYear == appointmentYear &&
                appt.doctor.toString() !== doctorId && appt.appointmentTime === newAppointmentTime) {
                return res.status(400).json({ message: 'You already have an appointment at this time with another doctor' });
            }
        });

        allAppointments.forEach((appt) => {
            const apptDate = new Date(appt.appointmentDate);
            const apptDay = apptDate.getDate();
            const apptMonth = apptDate.getMonth() + 1;
            const apptYear = apptDate.getFullYear();

            if (apptDay == appointmentDay && apptMonth == appointmentMonth && apptYear == appointmentYear &&
                appt.patient.toString() !== patientId && appt.doctor.toString() === doctorId && appt.appointmentTime === newAppointmentTime) {
                return res.status(400).json({ message: 'Another patient has an appointment at this time with this doctor' });
            }
        });

        appointment.patient = patientId;
        appointment.doctor = doctorId;
        appointment.appointmentDate = apptDate;
        appointment.appointmentTime = newAppointmentTime;

        await appointment.save();

        res.status(200).json({ message: 'Appointment updated successfully', appointment });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// router.post('/', async (req, res) => {
//     try {
//         const { appointmentDate, appointmentTime, fees, patientId, doctorId } = req.body;
        
//         if (fees < 0) {
//             return res.status(400).json({ message: 'Fees cannot be negative' });
//         }

//         const apptDate = new Date(appointmentDate);
//         const appointmentDay = apptDate.getDate();
//         const appointmentMonth = apptDate.getMonth() + 1;
//         const appointmentYear = apptDate.getFullYear();

//         // Retrieve all appointments for the patient and doctor
//         const appointments = await Appointment.find({
//             $or: [
//                 { patient: patientId },
//                 { doctor: doctorId }
//             ]
//         });

//         // Check for conflicting appointments
//         const hasConflict = appointments.some(appt => {
//             const apptDate = new Date(appt.appointmentDate);
//             const apptDay = apptDate.getDate();
//             const apptMonth = apptDate.getMonth() + 1;
//             const apptYear = apptDate.getFullYear();

//             // Check if the date matches
//             const sameDate = apptDay === appointmentDay && apptMonth === appointmentMonth && apptYear === appointmentYear;
//             const sameTime = appt.appointmentTime === appointmentTime;

//             if (sameDate && sameTime && appt.patient.toString() !== patientId && appt.doctor.toString() === doctorId) {
//                 throw new Error('Some patient has an appointment at this time');
//             }
//             if (sameDate && appt.patient.toString() === patientId && appt.doctor.toString() === doctorId) {
//                 throw new Error('Patient has an appointment on this day with this doctor');
//             }
//             if (sameDate && appt.patient.toString() === patientId && appt.doctor.toString() !== doctorId && sameTime) {
//                 throw new Error('You already have an appointment at this time');
//             }

//             return false;
//         });

//         if (!hasConflict) {
//             // Create a new appointment
//             const appointment = new Appointment({
//                 appointmentDate: apptDate,
//                 appointmentTime,
//                 fees,
//                 patient: patientId,
//                 doctor: doctorId
//             });
//             const savedAppointment = await appointment.save();

//             return res.status(200).json({ message: 'Appointment created successfully', appointment: savedAppointment });
//         }
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });


module.exports = router;