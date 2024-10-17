const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/user_route');
const taskRouter = require('./routes/task_route');

require('dotenv').config();

const app  = express();

const port = process.env.PORT || 3000;


// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URL, {
    ssl: true,  // Ensure SSL is enabled for Atlas
    tlsInsecure: true  // (Optional) Disable strict SSL validation if necessary
})
.then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);



app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});