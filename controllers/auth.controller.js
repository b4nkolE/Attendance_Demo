import mongoose from "mongoose";
import Auth from "../models/auth.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import { authMiddleware } from "../middlewares/admin.auth.js";



// async function session(){
//     const session = await mongoose.startSession();
//     session.startTransaction();
// }


export const signUp = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //creates a constructor for the sign-up model.
        const {name, email, password, track} = req.body;

        //checks if all fields, another level of validation.
        if(!name || !email || !password ||!track){
            session.abortTransaction();
            return res.status(400).json({message: "All fields are required"});
        }
        //checks if users exists during sign-up.
        const userExists = await Auth.findOne({email}).session(session);
        if(userExists){
            session.abortTransaction();
            return res.status(400).json({message: "User exists, Go to login page"});
        }
        //hahing the password before saving it.
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);

        //creating user after password hashing
        const newUser = await Auth.create([{name, email, password:hashpassword, track}], {session});
        const token = jwt.sign({userId: newUser[0]._id, email: newUser[0].email}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
        session.commitTransaction();
        return res.status(201).json({message: "User created successfully"});

    } catch (error) {
        await session.endSession();
        return res.status(500).json({message: "Server error", error: error.message});
    }
}

export const signIn = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        //creates a constructor for the sign-in model.
        const {email, password} = req.body;

        //check if the fields are empty.
        if(!email||!password ){
            session.abortTransaction();
            return res.status(400).json({message: "Both email & password are required"});
        }

        //checks if user doesn't exist.
        const userExist = await Auth.findOne({email}).session(session);
        if(!userExist){
            session.abortTransaction();
            return res.status(400).json({message: "User doesn't exist go to sign-up page"});
        }

        //checks if the passwords match
        const match = bcrypt.compare(password, userExist.password);
        if (!match){
            session.abortTransaction();
            return res.status(401).json({message: "Invalid Password"});
        }
        //After it's passed through all these checks, sign in
        session.commitTransaction();
        const token = jwt.sign({userId: userExist._id, name: userExist.name}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
        return res.status(200).json({message: "Login sucessful", token});
    } catch(error){
        session.endSession();
        return res.status(500).json({message: "Server error", error: error.message});
    }

}

export const adminValidation = (req, res) => {
    return res.status(200).json({message: `Welcome to your dashboard ${req.auth.name}`});
}




