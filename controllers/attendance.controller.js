import Enroll from "../models/enroll.model.js";
import Attendance from "../models/attendance.model.js";


export const markAttendance = async (req, res, next) => {
    try {
        const {email, phoneNumber} = req.body;

        if(!email || !phoneNumber){
            return res.status(400).json({message: "Email and Phone Number required!"});
        }

        const findStudent = await Enroll.findOne({email, phoneNumber});
        if(!findStudent){
            return res.status(404).json({message: "Not Enrolled"});
        }

        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const todayEnd = new Date(today.setHours(23, 59, 59, 999));

        const markedAttendance = await Attendance.findOne({studentId: findStudent._id, date: {$gte: todayStart, $lte: todayEnd}});
        if(markedAttendance){
            return res.status(400).json({message: "you already marked attendance today, try again tomorrow!"});
        }

        const createRecord = await Attendance.create({studentId: findStudent._id, status: "present"});
        return res.status(201).json({message: "Attendance Marked Successfully",
            student: {
                name: `${findStudent.firstName} ${findStudent.lastName}`,
                date: createRecord.date
            }
        });
    } catch (error) {
        next(error);
    }
}