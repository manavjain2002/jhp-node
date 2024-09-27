const express = require("express");
const router = express.Router();
const bcrypt = require("../helpers/bcrypt");
const crypto = require("crypto");

const {
  findTeacherByUsername,
  createTeacherData,
  updateTeacherData,
  findTeacherByResetPasswordToken,
  findTeacherByResetEmailToken,
  deleteTeacherData,
  getAllTeachers,
  findTeacherById,
  getTeachersCount,
} = require("../services/teacher");

const { sendEmail } = require("../helpers/sendEmail");
const { signJwt } = require("../helpers/jwt");
const { userMiddleware } = require("../middlewares/middleware");
require("dotenv").config();

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone number validation regex (simple international format)
const phoneRegex = /^\d{10}$/;

// Function to validate email
function validateEmail(email) {
  return emailRegex.test(email);
}

// Function to validate phone number, defaulting to +91 if no prefix is provided
function validatePhoneNumber(phone_number) {
  return phoneRegex.test(phone_number);
}

module.exports = function () {
  // Check username if present in db or not.
  router.get("/teachers/check_username/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const isUsernamePresent = await findTeacherByUsername(username);
      if (isUsernamePresent) {
        res
          .status(422)
          .json({ message: "Username already present.", data: false });
      } else {
        res.status(200).json({ message: "Username not present", data: true });
      }
    } catch (error) {
      console.error("Error while checking username:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });
  // Get teacher by username.
  router.get(
    "/teachers/username/:username",
    userMiddleware,
    async (req, res) => {
      try {
        const { username } = req.params;
        const user = await findTeacherByUsername(username);
        if (user) {
          res.status(200).json({ message: "Teacher found", data: user });
        } else {
          res.status(204).json({ message: "Teacher not found", data: null });
        }
      } catch (error) {
        console.error("Error while getting teacher with unique id:", error);
        res.status(500).send(`Internal Server Error: ${error}`);
      }
    }
  );

  // Get teachers.
  router.get("/teachers", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;

      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const organization_id =
        student && student?.organization_id
          ? student?.organization_id
          : teacher?.organization_id;

      const totalTeacherCount = await getTeachersCount(organization_id, searchKey);

      const teachers = await getAllTeachers(
        searchKey,
        sortBy,
        organization_id,
        sortOrder,
        limit,
        offset
      );

      if (teachers && teachers.length > 0) {
        res.status(200).json({
          message: "Teachers found",
          data: {
            teachers,
            offset,
            totalCount: totalTeacherCount,
          },
        });
      } else {
        res.status(204).json({ message: "Teachers not found", data: null });
      }
    } catch (error) {
      console.error("Error while getting teachers data:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  // Get teacher by id.
  router.get("/teachers/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const teacher = await findTeacherById(id);
      if (teacher) {
        res.status(200).json({ message: "Teacher found", data: teacher });
      } else {
        res.status(204).json({ message: "Teacher not found", data: null });
      }
    } catch (error) {
      console.error("Error while getting teacher with id:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  // Create teacher
  router.post("/teachers/signup", async (req, res) => {
    try {
      // Extract necessary data from request body
      const {
        teacher_first_name,
        teacher_last_name,
        teacher_phone_number,
        teacher_address,
        teacher_email,
        teacher_password,
        teacher_birth_date,
        teacher_gender,
        teacher_username,
        organization_id,
        master_role_id,
      } = req.body;

      if (
        !teacher_first_name ||
        !teacher_last_name ||
        !teacher_phone_number ||
        !teacher_email ||
        !teacher_password ||
        !teacher_birth_date ||
        !teacher_gender ||
        !teacher_username ||
        !organization_id ||
        !teacher_address ||
        !master_role_id
      ) {
        res
          .status(422)
          .json({ message: "Fill all the fields properly", data: null });
        return;
      }

      const isUsernamePresent = await findTeacherByUsername(teacher_username);
      if (isUsernamePresent) {
        res
          .status(422)
          .json({ message: "Username already present.", data: false });
        return;
      }

      if (teacher_password.length < 4 || teacher_password.length >= 12) {
        res
          .status(422)
          .send("Password length should be between 4 to 12 characters.");
        return;
      }

      if (
        !validateEmail(teacher_email) ||
        !validatePhoneNumber(teacher_phone_number)
      ) {
        res.status(422).json({ message: "Invalid email or phone number." });
        return;
      }

      // hash password
      let encPassword = bcrypt.createHash(teacher_password);
      const teacher = await createTeacherData({
        teacher_first_name,
        teacher_last_name,
        teacher_phone_number,
        teacher_email,
        teacher_address,
        teacher_password: encPassword,
        teacher_birth_date,
        teacher_gender,
        teacher_username,
        organization_id,
        master_role_id,
      });

      if (teacher) {
        //   // Sending mail
        // const subject = `Welcome to JHP Family`;
        // const text = `Your registration is successful\n Your Unique Id : ${unique_id}.\n Your password is : ${password} \n Use this unique id to login `;
        // const isMailSent = await sendEmail(email, subject, text);
        // if (!isMailSent) {
        //   console.error(`Unable to send mail`);
        // } else {
        res.status(200).json({ message: "Signup successful", data: teacher });
        // }
      } else {
        res.status(500).json({ message: "There is some error with server."});
      }
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Login route
  router.post("/teachers/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(422).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      const teacher = await findTeacherByUsername(username);
      if (teacher) {
        const isValidPassword = bcrypt.isValidPassword(
          teacher.teacher_password,
          password
        );
        if (isValidPassword) {
          const token = signJwt(teacher);
          if (token) {
            res.status(200).json({
              message: `Login successful for teacher`,
              data: {
                teacher_id: teacher.teacher_id,
                teacher_username: teacher.teacher_username,
                teacher_first_name: teacher.teacher_first_name,
                teacher_last_name: teacher.teacher_last_name,
                token: token,
                master_role_id: teacher.master_role_id,
                role_access: teacher.master_role?.role_access
              },
            });
          } else {
            res.status(500).json({
              message: `Internal Server Error while creating jwt token`,
            });
            return;
          }
        } else {
          res.status(422).json({ message: `Invalid username or password` });
          return;
        }
      } else {
        res.status(422).json({ message: `User does not exist` });
        return;
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error: ${error}`,
      });
    }
  });

  // Update profile route
  router.post("/teachers/update_profile", userMiddleware, async (req, res) => {
    const { teacher, data, admin } = req.body;
    try {
      const updatedTeacher = await updateTeacherData(
        { teacher_username: data.teacher_username },
        data
      );

      if (updatedTeacher) {
        const data = (({
          teacher_password,
          teacher_id,
          teacher_username,
          ...o
        }) => o)(updatedTeacher);
        res.status(200).json({
          message: `Teacher profile updated successfully.`,
          data: {
            user: data,
          },
        });
      } else {
        res.status(422).json({
          message: `Invalid data`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error: ${error}`,
      });
    }
  });

  // Update profile route
  router.post("/teachers/update_my_profile", userMiddleware, async (req, res) => {
    const { teacher, data, admin } = req.body;
    try {
      const updatedTeacher = await updateTeacherData(
        { teacher_id: teacher.teacher_id },
        data
      );

      if (updatedTeacher) {
        const data = (({
          teacher_password,
          teacher_id,
          teacher_username,
          ...o
        }) => o)(updatedTeacher);
        res.status(200).json({
          message: `Teacher profile updated successfully.`,
          data: {
            user: data,
          },
        });
      } else {
        res.status(422).json({
          message: `Invalid data`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error: ${error}`,
      });
    }
  });

  // Change password
  router.post("/teachers/change_password", userMiddleware, async (req, res) => {
    const { teacher, oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(422).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      if (bcrypt.isValidPassword(teacher.teacher_password, oldPassword)) {
        if (newPassword.length <= 4 || newPassword.length >= 12) {
          res
            .status(422)
            .send("New Password length should be between 4 to 12 characters.");
          return;
        }
        const newEncPassword = bcrypt.createHash(newPassword);
        const updatedTeacher = await updateTeacherData(
          { teacher_id: teacher.teacher_id },
          {
            teacher_password: newEncPassword,
          }
        );
        if (updatedTeacher) {
          res.status(200).json({
            message: `Teacher's password changed successfully.`,
          });
        } else {
          res.status(500).json({
            message: `Failed to update password.`,
          });
        }
      } else {
        res.status(422).json({
          message: `Invalid Password provided.`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error: ${error}`,
      });
    }
  });

  // Forgot password
  router.post("/teachers/forgot_password", async (req, res) => {
    const { username, email } = req.body;
    try {
      const teacherByUsername = await findTeacherByUsername(username);
      if (
        teacherByUsername &&
        teacherByUsername.teacher_email.toLowerCase() == email.toLowerCase()
      ) {
        const token = crypto.randomBytes(20).toString("hex");
        const updatedTeacher = await updateTeacherData(
          { teacher_username: username },
          {
            teacher_reset_password_token: token,
            teacher_reset_password_token_expiration: new Date(
              Date.now() + 3600000
            ).toISOString(), // 10 minutes
          }
        );

        if (!updatedTeacher) {
          res.status(500).json({
            message: `Teacher's data not updated for reset token.`,
          });
          return;
        }

        const to = email.toLowerCase();
        const subject = "Password Reset";
        const text =
          `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${process.env.BASE_URL}/users/reset/${token}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`;
        const isMailSent = await sendEmail(to, subject, text);
        if (isMailSent) {
          res.status(200).json({
            message: `Password reset link sent on email.`,
          });
          return;
        } else {
          res.status(500).json({
            message: `Password reset link sending failed.`,
          });
        }
      } else {
        res.status(422).json({
          message: `Invalid unique Id`,
        });
        return;
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error while forgot password: ${error}` });
      return;
    }
  });

  // Password reset form
  router.get("/teachers/reset/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const teacherData = await findTeacherByResetPasswordToken(token);
      if (!teacherData) {
        return res
          .status(422)
          .send("Password reset token is invalid or has expired");
      } else {
        res.status(200).json({
          message: `Correct Teacher.`,
        });
      }
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Password reset
  router.post("/teachers/reset/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const { password, username } = req.body;
      if (password.length <= 4 || password.length >= 12) {
        res
          .status(422)
          .send("Password length should be between 4 to 12 characters.");
        return;
      }
      const teacherData = await findTeacherByResetPasswordToken(token);
      if (!teacherData) {
        res.status(422).send("Password reset token is invalid or has expired");
        return;
      }

      // Update user's password here
      const updatedTeacherData = await updateTeacherData(
        {
          teacher_reset_password_token: token,
          teacher_username: username,
        },
        {
          teacher_password: bcrypt.createHash(password),
          teacher_reset_password_token: "",
          teacher_reset_password_token_expiration: new Date(
            Date.now()
          ).toISOString(),
        }
      );

      if (!updatedTeacherData) {
        res.status(500).json({ message: `Teacher not updated` });
        return;
      }

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  // Delete user by unique Id.
  router.delete("/teachers/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { teacher, admin } = req.body;
      if (teacher && (teacher.teacher_id == id || admin)) {
        const deletedTeacher = await deleteTeacherData({ teacher_id: id });
        if (deletedTeacher) {
          res.status(200).json({
            message: "Teacher deleted",
            data: { teacher: deletedTeacher },
          });
        } else {
          res.status(500).json({ message: "Unable to delete teacher" });
        }
      } else {
        res.status(204).json({ message: "Teacher not found" });
      }
    } catch (error) {
      console.error("Error while getting teacher with unique id:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  return router;
};
