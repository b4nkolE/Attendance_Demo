import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";

export const enroll = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { firstName, lastName, email, phoneNumber, gender, learningTrack } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !gender ||
      !learningTrack
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await Enroll.findOne({ email }).session(session);
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User has already been enrolled" });
    }

    const newStudent = await Enroll.create(
      [{ firstName, lastName, email, phoneNumber, gender, learningTrack }],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ message: "Enrolled Successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

const checkWeekend = (date) => {
  const theDay = new Date(date).getDay();
  return theDay === 0 || theDay === 6;
};

const dayBegins = (date) => {
  const todayStarts = new Date(date);
  todayStarts.setHours(0, 0, 0, 0);
  return todayStarts;
};

const dayEnds = (date) => {
  const todayEnds = new Date(date);
  todayEnds.setHours(23, 59, 59, 999);
  return todayEnds;
};

//get working days range
const getWorkingDays = (startDate, endDate) => {
  const workingDays = [];
  const thisDate = new Date(startDate);
  while (thisDate <= endDate) {
    if (!checkWeekend(thisDate)) {
      workingDays.push(new Date(thisDate));
    }
    thisDate.setDate(thisDate.getDate() + 1);
  }
  return workingDays;
};

export const markAttendance = async (req, res) => {
    try {
        const {email} = req.body;

        if(!email){
            return res.status(400).json({message: "Email field is required"});
        }

        const student = await Enroll.findOne({email});
        if(!student){
            return res.status(404).json({message: "Student not enrolled!"});
        }

        const today = new Date();
        if(checkWeekend(today)){
            return res.status(400).json({message: "Attendance cannot be marked on the weekend"});
        }

        const startOfDay = dayBegins(today);
        const endOfDay = dayBegins(today);

        const alreadyMarked = student.attendance.some((record) => {
            const recordDate = new Date(record.date);
            return recordDate >= startOfDay && recordDate <= endOfDay;
        });

        if(alreadyMarked){
            return res.status(400).json({message: "Attendance already taken"});
        }

        student.attendance.push({
            date: today,
            status: "present"
        });
        await student.save();
        return res.status(200).json({message: "Attendance marked successfully"});
    } catch (error) {
        return res.status(500).json({message: "Something went wrong", error: error.message});
    }
}

