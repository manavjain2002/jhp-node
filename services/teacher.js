const { prisma } = require("../prisma/client");

const teacherOutputData = {
  teacher_id: true,
  teacher_first_name: true,
  teacher_last_name: true,
  teacher_phone_number: true,
  teacher_address: true,
  teacher_email: true,
  teacher_birth_date: true,
  teacher_password: true,
  teacher_gender: true,
  teacher_username: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
  master_role_id: true,
  master_role: {
    select: {
      role_access: true,
    },
  },
};

async function createTeacherData(data) {
  const teacher = await prisma.teacher.create({
    data,
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherByUsername(username) {
  const teacher = await prisma.teacher.findUnique({
    where: {
      teacher_username: username,
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherById(id) {
  const teacher = await prisma.teacher.findUnique({
    where: {
      teacher_id: id,
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherByResetPasswordToken(token) {
  const teacher = await prisma.teacher.findFirst({
    where: {
      teacher_reset_password_token: token,
      teacher_reset_password_token_expiration: {
        gte: new Date(),
      },
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherByResetEmailToken(username, token) {
  const teacher = await prisma.teacher.findFirst({
    where: {
      teacher_username: username,
      teacher_reset_email_token: token,
      teacher_reset_email_token_expiration: {
        gte: new Date(),
      },
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherByEmail(email) {
  const teacher = await prisma.teacher.findMany({
    where: {
      teacher_email: email,
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function updateTeacherData(filter, data) {
  const teacher = await prisma.teacher.update({
    where: filter,
    data,
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function deleteTeacherData(filter) {
  const teacher = await prisma.teacher.delete({
    where: filter,
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function getAllTeachers(
  searchKey,
  sortBy,
  organization_id,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const teacher = await prisma.teacher.findMany({
    where: buildWhereClause(organization_id, searchKey),
    select: teacherOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (teacher) {
    return teacher;
  }
  return;
}

function buildWhereClause(organization_id, searchKey) {
  let whereClause = {
    organization_id,
  };

  if (searchKey) {
    whereClause = {
      ...whereClause,
      OR: [
        {
          teacher_first_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          teacher_last_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          teacher_email: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          teacher_address: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          teacher_phone_number: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          teacher_username: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
      ],
    };
  }

  return whereClause;
}

function buildOrderClause(sortBy, sortOrder) {
  let orderClause = {
    teacher_birth_date: "asc",
  };

  if (!sortOrder) {
    sortOrder = "asc";
  }

  if (sortBy) {
    orderClause = {
      [sortBy]: sortOrder,
    };
  }

  return orderClause;
}

async function getTeachersCount(organization_id, searchKey) {
  const teacherCount = await prisma.teacher.count({
    where: buildWhereClause(organization_id, searchKey),
  });

  return teacherCount;
}

async function isAdmin(id, organization_id) {
  const student = await prisma.teacher.findUnique({
    where: {
      teacher_id: id,
      organization_id,
    },
  });

  if (student?.master_role_id == 1) {
    return true;
  }
  return;
}

async function isOnlyTeacher(id, organization_id) {
  const student = await prisma.teacher.findUnique({
    where: {
      teacher_id: id,
      organization_id,
    },
  });

  if (student.master_role_id == 2) {
    return true;
  }
  return;
}

async function isOnlySupportUser(id, organization_id) {
  const student = await prisma.teacher.findUnique({
    where: {
      teacher_id: id,
      organization_id,
    },
  });

  if (student.master_role_id == 3) {
    return true;
  }
  return;
}

module.exports = {
  findTeacherByUsername,
  findTeacherByEmail,
  findTeacherById,
  findTeacherByResetPasswordToken,
  findTeacherByResetEmailToken,
  getAllTeachers,
  createTeacherData,
  updateTeacherData,
  deleteTeacherData,
  getTeachersCount,
  isAdmin,
  isOnlySupportUser,
  isOnlyTeacher,
};
