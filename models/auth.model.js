import mongoose from "mongoose"
const {Schema, model} = mongoose;



const authschema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: [4, "name must be more than 4 characters"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: [10, "Email must be more than 10 charcters"],
        match: [/\S+@\S+\.\S+/, "Email is invalid"]
    },
    password :{
        type: String,
        required: true,
        trim: true,
        minLength: [8, "Password has to be more than 8 characters"]
    },
    track: {
        type: String,
        enum: [
            "Fullstack Development" ,
            "Backend Development",
            "Cyber Security",
            "Cloud Computing",
            "Data Analytics"
        ],
        required: true
    }
},{timestamps: true});


const Auth = model("Auth", authschema);
export default Auth;