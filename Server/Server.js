import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './Config/db.config.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
connectDB();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})