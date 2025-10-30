import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";


export const enroll = async(req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const {firstName, lastName, email, phoneNumber, gender, learningTrack} = req.body;

        if(!firstName|| !lastName|| !email|| !phoneNumber|| !gender || !learningTrack){
            return res.status(400).json({message: "All fields are required"});
        }

        const userExists = await Enroll.findOne({email}).session(session);
        if(userExists){
            return res.status(400).json({message: "User has already been enrolled"});
        }

        const newStudent = await Enroll.create([{firstName, lastName, email, phoneNumber, gender, learningTrack}], {session});
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json({message: "Enrolled Successfully"});
    } catch (error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
} 