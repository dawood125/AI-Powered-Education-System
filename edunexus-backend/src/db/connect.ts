import mongoose from "mongoose";
import {config} from "../config/env";

const maxRetryLimit=5;
let attempts=0;
const connectDB= async ()=>{
    try {
        const state = mongoose.connection.readyState;
         if(state ===0){
            console.log('Database is Disconnected');
            await mongoose.connect(config.mongodbUri as string);
        }
        if(state ===1){
            console.log('Already Connected to MongoDB');
            return;
        }
        if(state ===2){
            console.log('Database is Connecting');
            return;
        }
        if(state ===3){
            console.log('Database is Disconnecting');
            return;
        }
        console.log(`MongoDB Connected: ${config.mongodbUri}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error}`);
        attempts++;
        if(attempts<maxRetryLimit){
            setTimeout(connectDB, 1000);
        }else{
            console.error("Max retries reached, running without active DB connection");
        }
    }
}

export default connectDB