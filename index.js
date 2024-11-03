const express = require('express');
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('./config/db');
const cors = require('cors');
const doctorRouter = require('./controllers/doctors.controller');
const patientRouter = require('./controllers/patients.controller');
const receptionistRouter = require('./controllers/receptionists.controller');
const adminRouter = require('./controllers/admin.controller')
const authRouter = require('./controllers/login.controller')
const appointmentRouter = require('./controllers/appointment.controller');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/doctors', doctorRouter);
app.use('/api/patients', patientRouter);
app.use('/api/receptionists', receptionistRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentRouter)

 
app.listen(5000, function(){
    console.log('Server is running on port 5000'); 
});