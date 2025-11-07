import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AttendanceSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["present", "absent"],
    required: true
  }
}, {_id: false});


const EnrollSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minLength: [4, "Name must be more than 4 characters"],
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minLength: [4, "Name must be more than 4 characters"],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: [10, "Email must be more than 10 charcters"],
    match: [/\S+@\S+\.\S+/, "Email is invalid"],
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
    maxLength: [10, "phone number is not 10 digits"],
    match: [/^\+?[1-9]\d{1,14}$/, "Phone Number is invalid"],
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female"],
  },
  learningTrack: {
    type: String,
    enum: [
      "Fullstack Development",
      "Backend Development",
      "Cyber Security",
      "Cloud Computing",
      "Data Analytics",
    ],
    required: true,
  },
  attendance:{
    type: [AttendanceSchema],
    default: []
  }

}, {timestamps: true});


EnrollSchema.index({email: 1});
EnrollSchema.index({"attendance.date" : 1});


// combines firstName and lastname together,
EnrollSchema.virtual("fullname").get(function(){
  return `${this.firstName} ${this.lastName}`
});

EnrollSchema.methods.getAttendancePercentage = function(){
  // check if student has any attendance record
  if(this.attendance.length === 0) return 0;

  //check how many times they were present
  const presentCount = this.attendance.filter((record) => record.status === "present").length;

  //calculate the percentage
  return ((presentCount / this.attendance.length) * 100).toFixed(2);


}

//method to get attendance by date range
EnrollSchema.methods.getAttendanceByDateRange = function(startDate, endDate){
  return this.attendance.filter((record) => {
    const recordDate = new Date (record.date);
    return recordDate >= startDate && recordDate <= endDate;

  });

}

EnrollSchema.statics.findLowAttendanceStudents = async function(threshold = 75){
  //Get all students from database
    const students = await this.find({});
  // filter all the students with attendance below threshold
  return students.filter((student) => {
    const percentage = student.getAttendancePercentage();
    return parseFloat(percentage) < threshold;
  })
}

const Enroll = model("Enroll", EnrollSchema);
export default Enroll;
