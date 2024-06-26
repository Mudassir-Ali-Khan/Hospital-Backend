const express = require('express');
const hash512 = require('../utils/hash');
const generateToken = require('../utils/jwt');

const Admin = require('../models/admin.model');

const router = express.Router();

router.post('/login', async function (req, res) {
    try {
        const userEmail = req.body.email;
        const password = req.body.password;
        // const { email, password } = req.body;
        // mk@admin.com, mk@patient.com, mk@doctor.com, mk@receptionist.com

     if (!userEmail || !password) {
        res.status(401);
        throw new Error("Invalid email or password");
     }

      const hashedPassword = hash512(password).toString();

      if (userEmail.includes('@admin.com')) { // for admin
        const adminObj = await Admin.findOne({ email: userEmail, password: hashedPassword }) // null, returns the object

        if (adminObj === null) {
            res.status(401);
            throw new Error("Invalid email or password");    
        } else {
            // data, private/secret key, expiry time
            const myTokenObj = {
                email: adminObj.email,
                fullname: adminObj.fullname,
                isAdmin: adminObj.isAdmin,
                _id: adminObj._id,
            }
            // const token = generateToken(myTokenObj)
            const token = generateToken({
                email: adminObj.email,
                fullname: adminObj.fullname,
                isAdmin: adminObj.isAdmin,
                _id: adminObj._id,
            });
            res.status(200).json({
                message: 'Login successful',
                token,
                user: myTokenObj
            });
        }
      } else if (userEmail.includes('@patient.com')) { // for patient

      } else if (userEmail.includes('@doctor.com')) { // for doctors
        
      } else if (userEmail.includes('@receptionist.com')) { // for receptionist

      } else {
        res.status(401);
        throw new Error("Invalid email or password");
      }

    } catch (error) {
        res.json({
            message: error.message
        });
    }
});

module.exports = router;