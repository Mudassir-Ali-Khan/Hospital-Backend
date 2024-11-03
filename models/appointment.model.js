const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    appointmentDate: Date,
    appointmentTime: String,
    fees: Number,
    // instead of patient: String, use below lines:
    patient: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Patient',
       required: true, 
    },
    // instead of doctor: String, use below lines:
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true, 
    },
    appointmentStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'cancelled']
    }
}, {
    timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;