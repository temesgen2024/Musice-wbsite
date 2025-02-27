import mongoose from "mongoose";
import {setTimeout} from "timers/promises";
import dotenv from "dotenv";

dotenv.config();

const dburl = process.env.MONGO_URI;
const connectDB = async () =>{
    try {
       const data = await mongoose.connect(dburl, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 30000,
        });
        console.log(`MongoDB Connected: ${data.connection.host}`); 
    } catch (error) {
       console.log(`Error: ${error.message}`);
       setTimeout (5000)
       await connectDB();
    }
}

export default connectDB;
