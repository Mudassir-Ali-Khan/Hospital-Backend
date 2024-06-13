const express = require('express');
const mongoose = require('./config/db');
const cors = require('cors');
const doctorRouter = require('./controllers/doctors.controller');
const patientRouter = require('./controllers/patients.controller');
const receptionistRouter = require('./controllers/receptionists.controller');


const app = express();


app.use(express.json());
app.use(cors());
app.use('/api/doctors', doctorRouter);
app.use('/api/patients', patientRouter);
app.use('/api/receptionists', receptionistRouter);


 
app.listen(5000, function(){
    console.log('Server is running on port 5000'); 
});