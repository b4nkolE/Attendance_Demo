import mongoose from "mongoose";
const { Schema, model } = mongoose;

const attendanceSchema = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enroll",
    required: true,
  },
  status: {
    type: String,
    enum: ["present"],
    required: true,
    default: "present"
  },
  date: {
    type: Date,
    default: Date.now,
  }
});


const Attendance = model("Attendance", attendanceSchema);
export default Attendance;
