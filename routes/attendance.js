const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");

const {
  getStudentAttendance,
  getAllStudentsAttendance,
  createAttendance,
  deleteAttendance,
  getAttendanceCountByMonth,
  getAllStudentsAttendanceData,
  getAttendanceCountByAnyMonth
} = require("../services/attendance");
const moment = require("moment");

const { findStudentById, getAllStudents } = require("../services/user");

const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get a student attendance data
  router.get(
    "/attendance/student/:student_id",
    userMiddleware,
    async (req, res) => {
      const { teacher } = req.body;
      const { student_id } = req.params;
      const { lowerDateLimit, upperDateLimit } = req.query;

      try {
        const studentData = await findStudentById(parseInt(student_id));
        if (
          studentData.assigned_to &&
          studentData.assigned_to != teacher.teacher_id
        ) {
          res.status(403).json({
            message: `Only assigned teacher can fetch the attendance`,
          });
        }
        const attendance = await getStudentAttendance(
          parseInt(student_id),
          lowerDateLimit,
          upperDateLimit
        );
        if (!attendance) {
          res.status(422).json({
            message: `No attendance found`,
          });
          return;
        }
        res.status(200).json({
          message: `Attendance found`,
          data: attendance,
        });
      } catch (error) {
        res.status(500).json({
          message: `Error while giving attendance - ${error}`,
        });
      }
    }
  );

  // Get the attendance of all students assigned to some teacher_id
  router.get("/attendance", userMiddleware, async (req, res) => {
    const { student, teacher } = req.body;
    const {
      lowerDateLimit,
      upperDateLimit,
      limit,
      searchKey,
      offset,
      sortBy,
      sortOrder,
    } = req.query;

    try {
      const organization_id =
        student && student?.organization_id
          ? student?.organization_id
          : teacher?.organization_id;

      let users = await getAllStudents(
        searchKey,
        sortBy,
        organization_id,
        sortOrder,
        limit,
        offset
      );

      users = users.map((user) => ({
        ...user,
        checked_dates: [],
      }));

      const studentIds = users.map((e) => e.student_id);

      const attendanceData = await getAllStudentsAttendanceData(
        teacher.teacher_id,
        lowerDateLimit,
        upperDateLimit,
        studentIds
      );

      users.forEach((user) => {
        user.name = user.first_name + " " + user.last_name;
        // Find the matching staff member based on student_id
        if (attendanceData.staff && attendanceData.staff.length > 0) {
          let staffMember = attendanceData.staff.find(
            (staff) => staff.student_id === user.student_id
          );
          if (staffMember) {
            // If found, push all dates from staffMember.checked_dates into user.checked_dates
            user.checked_dates.push(...staffMember.checked_dates);
          }
        }
      });

      // Dummy response
      /* const attendance = [{
      student_id: 1,
      name: "saunak shah",
      checked_dates: []
    }] */
      return res.status(200).json({
        message: `attendance found`,
        data: users,
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  router.get("/attendance-summary", userMiddleware, async (req, res) => {
    const { student } = req.body;
    const { lowerDateLimit, upperDateLimit } = req.query;

    try {
      let result = [];
      let current = moment(); // Setting to September 2024 for the given scenario

      for (let i = 0; i < 7; i++) {
        const monthName = current.format("MMM YYYY");
        const monthNumber = current.month() + 1; // moment.js month is zero-indexed, add 1 for a 1-indexed result
        result.push({
          month: monthName,
          attendance_count: 0,
          monthNumber: monthNumber
        });
        // Move to the previous month
        current.subtract(1, 'months');
      }

      result.reverse();
    
      const attendance = await getAttendanceCountByMonth(
        student.student_id,
        lowerDateLimit,
        upperDateLimit
      );
      // Loop through the result array
      result.forEach(resultItem => {
        // Find if there's a corresponding month in the attendance array
        const attendanceItem = attendance.find(item => item.month === resultItem.month);

        // If found, update the attendance_count of the result item
        if (attendanceItem) {
          resultItem.attendance_count = attendanceItem.attendance_count;
        }
      });
      result.reverse();
      
      if (!result) {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }
      res.status(200).json({
        message: `attendance found`,
        data: result,
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  router.post("/attendance_report", userMiddleware, async (req, res) => {
    const { teacher, dateMonth } = req.body;

    let formatDate = moment(dateMonth).format("YYYY-MM-DD")    
    try {
      let attendance = await getAttendanceCountByAnyMonth(formatDate, teacher);
      
      if (!attendance) {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }

      res.status(200).json({
        message: `attendance found`,
        data: attendance,
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  // Create attendance
  router.post("/attendance", userMiddleware, async (req, res) => {
    const { teacher, attendance } = req.body;
    if (!teacher) {
      res.status(403).json({
        message: `Only teacher can create attendance`,
      });
      return;
    }
    try {
      if (!attendance) {
        res.status(400).json({
          message: `Fill all the fields properly.`,
        });
        return;
      }

      const attendanceData = await createAttendance(
        teacher.teacher_id,
        attendance
      );

      if (attendanceData) {
        res.status(200).json({
          message: `Attendance created successfully`,
          data: attendanceData,
        });
      } else {
        res.status(500).json({
          message: `Unable to fill attendanceData`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while filling attendanceData: ${error}`,
      });
    }
  });

  // only Admin
  // Delete Result
  router.delete("/attendance", userMiddleware, async (req, res) => {
    const { teacher, attendance } = req.body;
    if (!teacher) {
      res.status(403).json({
        message: `Only teacher can delete the attendance`,
      });
      return;
    }
    try {
      if (!attendance) {
        res.status(400).json({
          message: `Fill all the fields properly.`,
        });
        return;
      }

      const attendanceData = await deleteAttendance(
        teacher.teacher_id,
        attendance
      );

      if (attendanceData) {
        res.status(200).json({
          message: `Attendance deleted successfully`,
          data: attendanceData,
        });
      } else {
        res.status(500).json({
          message: `Unable to delete attendance`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting attendance: ${error}`,
      });
    }
  });

  return router;
};
