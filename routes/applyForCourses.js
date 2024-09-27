const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const {
  getAllApplications,
  findApplicationByRegistrationId,
  applyForCourse,
  getAllApplicationsByUserIdAndCourseId,
  deleteApplication,
  getAllApplicationsByUserId,
  getAllApplicationsByCourseId,
  getAllApplicationsCount,
  getAllApplicationsByUserIdCount,
  getAllApplicationsByCourseIdCount,
  getAllApplicationsByCourseIdToDownload,
} = require("../services/applyForCourse");
const { findCourseByCourseId } = require("../services/course");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all applications
  router.get("/registrations", userMiddleware, async (req, res) => {
    try {
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;
      const totalRegistrationCount = await getAllApplicationsCount(searchKey);
      const registrations = await getAllApplications(
        searchKey,
        sortBy,
        sortOrder,
        limit,
        offset
      );
      if (registrations) {
        res.status(200).json({
          message: `Fetched all registrations`,
          data: { registrations, offset, totalCount: totalRegistrationCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registrations`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting registrations: ${error}`,
      });
    }
  });

  // Get application by applicationId
  router.get("/registrations/check", userMiddleware, async (req, res) => {
    try {
      const { courseId, studentId } = req.query;
      const registration = await getAllApplicationsByUserIdAndCourseId(
        parseInt(studentId),
        parseInt(courseId)
      );
      if (registration) {
        res.status(200).json({
          message: `Fetched registration`,
          data: registration,
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registration`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting registration: ${error}`,
      });
    }
  });

  // Get application by applicationId
  router.get("/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(parseInt(req.params.id));
      const registration = await findApplicationByRegistrationId(id);
      if (registration) {
        res.status(200).json({
          message: `Fetched registration`,
          data: registration,
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registration`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting registration: ${error}`,
      });
    }
  });

  // Get application by userId
  router.get(
    "/students/registrations/:id",
    userMiddleware,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { limit, offset, searchKey, sortBy, sortOrder } = req.query;
        const registrationCount = await getAllApplicationsByUserIdCount(id, searchKey);
        const registrations = await getAllApplicationsByUserId(
          searchKey,
          sortBy,
          id,
          sortOrder,
          limit,
          offset
        );
        if (registrations) {
          res.status(200).json({
            message: `Fetched registrations`,
            data: { registrations, totalCount: registrationCount, offset },
          });
        } else {
          res.status(422).json({
            message: `Unable to fetch applications`,
          });
        }
      } catch (error) {
        res.status(500).json({
          message: `Internal Server Error while getting applications: ${error}`,
        });
      }
    }
  );

  // Get application by examId
  router.get("/courses/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const registrationCount = await getAllApplicationsByCourseIdCount(id, searchKey);
      const registrations = await getAllApplicationsByCourseId(
        searchKey,
        sortBy,
        id,
        sortOrder,
        limit,
        offset
      );
      if (registrations) {
        res.status(200).json({
          message: `Fetched registrations`,
          data: { registrations, offset, totalCount: registrationCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registrations`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting applications: ${error}`,
      });
    }
  });

  // Get application by examId
  router.get("/download/courses/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const registrationCount = await getAllApplicationsByCourseIdCount(id, searchKey);
      const registrations = await getAllApplicationsByCourseIdToDownload(
        searchKey,
        sortBy,
        id,
        sortOrder,
        limit,
        offset
      );
      if (registrations) {
        res.status(200).json({
          message: `Fetched registrations`,
          data: { registrations, offset, totalCount: registrationCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registrations`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting applications: ${error}`,
      });
    }
  });

  // Apply for exam
  router.post("/register/", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const { course_id, student } = req.body;

      if (!course_id) {
        res.status(422).json({
          message: `Course Id not valid.`,
        });
        return;
      }

      // select the exam which you want to give
      // after select the exam need to show information about exam like
      // generate unique exam id
      // check if already apply or not for requested exam

      const course = await findCourseByCourseId(course_id);
      if (
        !course ||
        course.registration_starting_date >
          new Date(Date.now()).toISOString() ||
        course.registration_closing_date < new Date(Date.now()).toISOString()
      ) {
        res.status(422).json({
          message: `Course registration cannot be done`,
        });
      }

      const isRegistered = await getAllApplicationsByUserIdAndCourseId(
        student.student_id,
        course_id
      );
      if (isRegistered && isRegistered.length > 0) {
        res.status(422).json({
          message: `Already registered`,
        });
        return;
      }

      const registration = await applyForCourse({
        student_id: student.student_id,
        course_id,
      });

      if (registration) {
        res.status(200).json({
          message: `registration filled successfully`,
          data: registration,
        });
      } else {
        res.status(500).json({
          message: `Unable to register for exam`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating registration: ${error}`,
      });
    }
  });

  // Update Application
  // router.put("/registration/:id", userMiddleware, async (req, res) => {
  //   const { student } = req.body;
  //   const id = parseInt(req.params.id);
  //   try {
  //     const { data } = req.body;
  //     const registration = await findApplicationByRegistrationId(
  //       id
  //     );
  //     if (registration) {
  //       if (registration?.user_id != student?.id) {
  //         res.status(403).json({
  //           message: `Unauthorized to update application.`,
  //         });
  //         return;
  //       }
  //       const updatedApplication = await updateApplication(
  //         { id },
  //         data
  //       );
  //       if (!updatedApplication) {
  //         res.status(500).json({
  //           message: `Unable to update exam registration.`,
  //         });
  //         return;
  //       }
  //       res.status(200).json({
  //         message: `Application updated successfully`,
  //         data: updatedApplication
  //       });
  //     } else {
  //       res.status(500).json({
  //         message: `Unable to find application`,
  //       });
  //     }
  //   } catch (error) {
  //     res.status(500).json({
  //       message: `Error while updating result: ${error}`,
  //     });
  //   }
  // });

  // Delete exam
  router.delete("/registration/:id", userMiddleware, async (req, res) => {
    const { student } = req.body;
    const id = parseInt(req.params.id);
    try {
      const registration = await findApplicationByRegistrationId(id);
      if (registration) {
        if (registration.student_id != student.student_id) {
          res.status(403).json({
            message: `Unauthorized to update registration.`,
          });
          return;
        }
        const deletedApplication = await deleteApplication({
          student_apply_course_id: id,
        });
        if (!deletedApplication) {
          res.status(500).json({
            message: `Unable to delete application.`,
          });
          return;
        }
        res.status(200).json({
          message: `Application deleted successfully`,
          data: deletedApplication,
        });
      } else {
        res.status(204).json({
          message: `Application not found`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting application: ${error}`,
      });
    }
  });

  return router;
};
