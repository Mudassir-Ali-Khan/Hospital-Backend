const mongoose = require('mongoose');

async function connectDB () { // This function is used to connect to the database
    try {
       const connection = await mongoose.connect(process.env.MONGOURL); // This will connect to the database
        console.log('Database connected', connection.connection.host); // This will print the host of the database
    } catch (error) {
        console.log(error); // If something fails in the connection of the database, this will print the error
        process.exit(1); // This will exit the process/server
    }
}

connectDB();


