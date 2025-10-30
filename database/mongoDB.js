import mongoose from "mongoose";
import { MONGODB_URL } from "../config/env.js";



export const DBconnection = async () => {
    try{
        await mongoose.connect(MONGODB_URL);
        console.log("Connection to the database successful");
    } catch(err) {
        console.log("There was an error connecting to the database", err);
    }

}