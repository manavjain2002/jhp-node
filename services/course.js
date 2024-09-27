const { prisma } = require("../prisma/client");

const courseOutputData = {
  course_id: true,
  created_at: true,
  updated_at: true,
  course_name: true,
  file_url: true,
  course_date: true,
  course_duration_in_hours: true,
  course_description: true,
  course_score: true,
  course_location: true,
  course_passing_score: true,
  course_max_attempts: true,
  is_active: true,
  registration_starting_date: true,
  registration_closing_date: true,
  result_date: true,
  created_by: true,
  category: true,
  organization_id: true,
};

async function createCourse(data) {
  const course = await prisma.course.create({
    data,
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

async function findCourseByCourseId(courseId) {
  const course = await prisma.course.findUnique({
    where: {
      course_id: courseId,
    },
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

async function getAllCourses(
  searchKey,
  sortBy,
  organization_id,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const courses = await prisma.course.findMany({
    where: buildWhereClause(organization_id, searchKey),
    select: courseOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (courses) {
    return courses;
  }
  return;
}

function buildWhereClause(organization_id, searchKey) {
  let whereClause;

  if (searchKey) {
    whereClause = {
      organization_id,
      OR: [
        {
          course_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          course_description: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          course_location: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          file_url: {
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
    course_date: "desc",
  };

  if (!sortOrder) {
    sortOrder = "desc";
  }

  if (sortBy) {
    orderClause = {
      [sortBy]: sortOrder,
    };
  }

  return orderClause;
}

async function getAllCoursesCount(organization_id, searchKey) {
  const coursesCount = await prisma.course.count({
    where: buildWhereClause(organization_id, searchKey),
  });

  return coursesCount;
}

async function getAllPendingCourses(limit, offset) {
  const courses = await prisma.course.findMany({
    where: {
      course_date: {
        gt: Date.now(),
      },
    },
    select: courseOutputData,
    orderBy: {
      course_date: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (courses) {
    return courses;
  }
  return;
}

async function getAllPendingCoursesCount() {
  const coursesCount = await prisma.course.count({
    where: {
      course_date: {
        gt: Date.now(),
      },
    },
  });

  return coursesCount;
}

async function updateCourse(filter, data) {
  const course = await prisma.course.update({
    where: filter,
    data,
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

async function deleteCourse(filter) {
  const course = await prisma.course.delete({
    where: filter,
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

module.exports = {
  createCourse,
  findCourseByCourseId,
  getAllCourses,
  getAllCoursesCount,
  updateCourse,
  deleteCourse,
  getAllPendingCourses,
  getAllPendingCoursesCount,
};
