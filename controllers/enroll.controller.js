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

//Helper Function
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
      return res.status(404).json({ message: "Student not enrolled!" });
    }

    const today = new Date();

    if (checkWeekend(today)) {
      return res
        .status(400)
        .json({ message: "Attendance cannot be marked on weekends" });
    }

    const dayStartsAt = dayBegins(today);
    const dayEndsAt = dayEnds(today);

    if (today < dayStartsAt) {
      return res.status(400).json({ message: "Attendance hasn't opened yet" });
    }

    if (today > dayEndsAt) {
      return res
        .status(400)
        .json({ message: "Attendance has closed for the day" });
    }

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
    //Declare today's date...
    const today = new Date();

    // use the date to check the weekend...
    if (checkWeekend(today)) {
      const message = "Weekend - Cannot mark attendance on weekends";
      console.log(message);

      if (res) {
        res.status(200).json({ message });
      }
      return;
    }

    //declare the start of today and the end of today
    const dawn = dayBegins(today); // Pass the today's date... 8:00 am
    const dusk = dayEnds(today); // 13:59 pm

    //Find all students in the database...
    const students = await Enroll.find({});

    //loop through all the students in order to find the ones that are present *today*.
    //declare all absent students
    let absentStudent = 0;

    //loop through
    for (const student of students) {
      const countPresent = student.attendance.some((record) => {
        //find from today's date
        const recordDate = new Date(record.date);
        return (
          record.status === "present" &&
          recordDate >= dawn &&
          recordDate <= dusk
        );
      });
      //if what has been looped through doesn't match the return values, push absent onto their record
      if (!countPresent) {
        student.attendance.push({
          date: today,
          status: "absent",
        });
        await student.save();
        absentStudent++;
        console.log(`Marked ${student.email} absent for ${today} `);
      }
    }
    console.log(`total numer of students marked absent is ${absentStudent}`);
    if (res) {
      res.json({ message: "Absence Added" });
    }
  } catch (error) {
    console.error(`Could not mark absence because of ${error}`);
    if (res) {
      res.status(500).json({ error: error.message });
    }
  }
};


//To get the total tracks...
export const getTotalTracks = async(req, res) =>{
  try{
  //get the schema
  const schema = await Enroll.schema;
  //get the field you need from the schema
  const theField = schema.path('learningTrack');
  //get the length of the field.
  const totalTracks = theField.options.enum.length;
  return res.status(200).json({message: "Total number of tracks is: ", tracks: totalTracks});
  } catch(error){
    return res.status(500).json({message: "something went wrong", error: error.message});
  }
}

export const getTotalAttendance = async(req, res) => {
  try{
    //get today's date
    const today = new Date();
    //get the start of day and end of day...
    const startOfDay = dayBegins(today);
    const endOfDay = dayEnds(today);

    //find the students
    const students = await Enroll.find({});
    //get the length of the documents
    const allStudents = students.length;

    //check if the students is empty...
    if(allStudents === 0){
      return res.status(200).json({message: "Total percentage is 0", percentage: 0});
    }

    //get all students that are present for a day
    let presentToday = 0;
    for (const student of students){
      const countPresent = student.attendance.some((record) => {
        const recordDate = new Date(record.date);
        return record.status === "present" && recordDate >= startOfDay && recordDate <= endOfDay; 
      });
      if(countPresent){
        presentToday++;
      }
    }
    //get abscence
    const getAbsentStudent = allStudents - presentToday;
    const absentStudent = (getAbsentStudent / allStudents) * 100;

    const presentStudents = (presentToday / allStudents) * 100;
    return res.status(200).json({message: "The total percentage of students present and absent are",
      present: presentStudents,
      absent: absentStudent,
      total: allStudents
    })
  } catch(error){
    return res.status(500).json({message: "Something went wrong", error: error.message});
  }
}

//get student by id
export const getStudentById = async(req, res) => {
  try{
      const {id} = req.params;

      const student = await Enroll.findById(id);

      if(!student){
        return res.status(400).json({message: "Student Id does not exist"});
      }

      const theStudent = {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      track: student.learningTrack,
      getAttendancePercentage: student.getAttendancePercentage(),
      }

      return res.status(200).json({message: "student found", student: theStudent});
  } catch(error){
    return res.status(500).json({message: "Something went wrong", error: error.message});
  }
}


export const getAttendanceByDateRange = async (req, res) => {
  try{
    const {start, end} = req.query;

    if(!start || !end){
      return res.status(400).json({message: "Start date and End date are required!"})
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if(isNaN(startDate) || isNaN(endDate)){
      return res.status(400).json({message: "Not a valid date, YYYY-MM-DD"});
    }

    const students = await Enroll.find({}, {
      firstName: 1,
      lastName: 1,
      email: 1,
      gender: 1,
      learningTrack: 1,
      attendance: 1,
    });

    const findStudents = students.map((student) => {
      const filteredStudents = student.attendance.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      })

      if(filteredStudents > 0){
        return {
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        track: student.learningTrack,
        gender: student.gender
      }
      }
      return null
    }).filter(Boolean)

    res.status(200).json({
      message: "successful",
      data: findStudents,
    })

  } catch (error){
    return res.status(500).json({message: "Something went wrong", error: error.message});
  }
}

export const getOverallAttendance =  async(req, res) => {
  try{
    //Adding filtering by track to it...
    const {learningTrack} = req.query;

    //create a tenary operator that accepts the track or not...
    const filter = learningTrack ? {learningTrack: learningTrack} : {};

    //Get all students..
    const students = await Enroll.find(filter);

    const allStudents = students.map((student) => ({
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      track: student.learningTrack,
      gender: student.gender,
      phoneNumber: student.phoneNumber,
      attendancePercentage: student.getAttendancePercentage()
    }));

    return res.status(200).json({message: "students gotten successfully", students: allStudents});
  } catch(error){
    return res.status(500).json({message: "Something went wrong", error: error.message});
  }
}