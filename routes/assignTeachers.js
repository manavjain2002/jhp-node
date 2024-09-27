const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");

const {
  findStudentById,
  updateStudentData,
  findStudentsAssignedToTeacherId,
  findStudentAssignedTeacher,
  getAllAssignees,
  getAllAssigneesCount,
  findStudentsAssignedToTeacherIdCount,
} = require("../services/user");
const { findTeacherById } = require("../services/teacher");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all teacher's assignees
  router.get(
    "/teachers/assignees/:teacher_id",
    userMiddleware,
    async (req, res) => {
      const teacher_id = parseInt(req.params.teacher_id);
      const {student, teacher} = req.body;

      const organization_id =
      student && student?.organization_id
        ? student?.organization_id
        : teacher?.organization_id;

      const { searchKey, sortBy, sortOrder, limit, offset } = req.query;
      try {
        const totalCount = await findStudentsAssignedToTeacherIdCount(organization_id, searchKey, teacher_id);
        const students = await findStudentsAssignedToTeacherId(
          organization_id,
          searchKey,
          sortBy,
          teacher_id,
          sortOrder,
          limit,
          offset
        );
        if (!students) {
          res.status(422).json({
            message: `No student found`,
          });
          return;
        }
        res.status(200).json({
          message: `Students found`,
          data: {
            users: students,
            totalCount: parseInt(totalCount)
          },
        });
      } catch (error) {
        res.status(500).json({
          message: `Error while giving teacher assignees - ${error}`,
        });
      }
    }
  );

  // Get the student assigned teacher's data
  router.get(
    "/students/assignees/:student_id",
    userMiddleware,
    async (req, res) => {
      const student_id = parseInt(req.params.student_id);
      try {
        const teacher = await findStudentAssignedTeacher(student_id);
        if (!teacher) {
          res.status(422).json({
            message: `No Teacher found`,
          });
          return;
        }
        res.status(200).json({
          message: `Teacher found`,
          data: teacher,
        });
      } catch (error) {
        console.error("Error getting teacher:", error);
        res.status(500).json({
          message: `Error while fetching teacher - ${error}`,
        });
      }
    }
  );

  // Get Result By Users
  router.get("/assignees", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;
      const organization_id =
        student && student?.organization_id
          ? student?.organization_id
          : teacher?.organization_id;
      const totalAssigneeCount = await getAllAssigneesCount(organization_id);
      const assignees = await getAllAssignees(
        searchKey,
        sortBy,
        organization_id,
        sortOrder,
        limit,
        offset
      );
      if (!assignees) {
        res.status(422).json({
          message: `Invalid data`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        data: { assignees, offset, totalCount: totalAssigneeCount },
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while fetching assignees: ${error}`,
      });
    }
  });

  // Create and Update Assignee
  router.post("/assign", userMiddleware, async (req, res) => {
    const { teacher } = req.body;
    /* if (!teacher) {
      res.status(403).json({
        message: `Only teacher or support user`,
      });
      return;
    } */
    try {
      const { student_id, teacher_id } = req.body;
      if (!student_id || !teacher_id) {
        res.status(400).json({
          message: `Fill all the fields properly.`,
        });
        return;
      }

      const student = await findStudentById(student_id);
      if (!student) {
        res.status(422).json({
          message: `Invalid student`,
        });
        return;
      }

      const isValidTeacher = await findTeacherById(teacher_id);
      if (!isValidTeacher) {
        res.status(422).json({
          message: `Invalid teacher`,
        });
        return;
      }

      if (student.assigned_to) {
        const teacherById = await findTeacherById(student.assigned_to);
        if (!teacherById) {
          res.status(422).json({
            message: `Invalid teacher`,
          });
          return;
        }

        if (teacherById.teacher_id != teacher.teacher_id) {
          res.status(403).json({
            message: `Only assigned user can update`,
          });
          return;
        }
      }
      const isAssigned = await updateStudentData(
        { student_id },
        { assigned_to: teacher_id }
      );

      if (isAssigned) {
        res.status(200).json({
          message: `Teacher assigned successfully`,
          data: isAssigned,
        });
      } else {
        res.status(500).json({
          message: `Unable to assign teacher`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while assigning teacher to student: ${error}`,
      });
    }
  });

  // only Admin
  // Delete Result
  router.delete("/assign", userMiddleware, async (req, res) => {
    const { teacher } = req.body;
    if (!teacher) {
      res.status(403).json({
        message: `Only teacher or support user`,
      });
      return;
    }
    try {
      const { student_id } = req.body;
      const teacherById = await findStudentAssignedTeacher(student_id);
      if (!teacherById) {
        res.status(422).json({
          message: `Invalid data`,
        });
        return;
      }
      if (teacher.teacher_id != teacherById.teacher_id) {
        res.status(403).json({
          message: "Only assigned teacher can delete.",
        });
        return;
      }

      const deletedAssignee = await updateStudentData(
        { student_id },
        { assigned_to: null }
      );
      if (!deletedAssignee) {
        res.status(500).json({
          message: `Unable to delete assignee.`,
        });
        return;
      }
      res.status(200).json({
        message: `Assignee deleted successfully`,
        data: deletedAssignee,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting assignee: ${error}`,
      });
    }
  });

  return router;
};
