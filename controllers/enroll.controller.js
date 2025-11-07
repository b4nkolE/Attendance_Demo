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
  todayStarts.setHours(9, 0, 0, 0);
  return todayStarts;
};

const dayEnds = (date) => {
  const todayEnds = new Date(date);
  todayEnds.setHours(13, 59, 59, 999);
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "provide valid email" });
    }

    const student = await Enroll.findOne({ email });

    if (!student) {
      return res.status(400).json({ message: "Student not enrolled!" });
    }

    const today = new Date();

    if (checkWeekend(today)) {
      return res
        .status(400)
        .json({ message: "Attendance cannot be marked on weekends" });
    }

    const dayStartsAt = dayBegins(today);
    const dayEndsAt = dayEnds(today);

    const marked = student.attendance.some((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= dayStartsAt && recordDate <= dayEndsAt;
    });

    if (marked) {
      return res
        .status(400)
        .json({ message: "Attendance already marked today" });
    }

    student.attendance.push({
      date: today,
      status: "present",
    });
    await student.save();

    return res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const autoMarkAbsence = async (req, res) => {
  try {
    const today = new Date();

    //Don't run on weekends
    if (checkWeekend(today)) {
      const message = "Weekend - No auto-marking needed";
      console.log(message);
      if (res) {
        return res.status(200).json({ message });
      }
      return;
    }

    const startOfDay = dayBegins(today);
    const endOfDay = dayEnds(today);

    const students = await Enroll.find({});
    let MarkedCount = 0;

    for (const student of students) {
      const countPresent = student.attendance.some((record) => {
        const recordDate = new Date(record.date);
        return (
          record.status === "present" &&
          recordDate >= startOfDay &&
          recordDate <= endOfDay
        );
      });

      if (!countPresent) {
        student.attendance.push({
          date: today,
          status: "absent",
        });

        await student.save();
        MarkedCount++;
        console.log(`Auto marked ${student.email} as absent today ${today}`);
      }
    }

    console.log(`The total students marked absent today is ${MarkedCount}`);

    if (res) {
      return res.json({ message: "Absence added" });
    }

    return;
  } catch (error) {
    console.error(`Error in absent marking ${error}`);
    if (res) {
      return res.status(500).json({ error: error.message });
    }
  }
};
