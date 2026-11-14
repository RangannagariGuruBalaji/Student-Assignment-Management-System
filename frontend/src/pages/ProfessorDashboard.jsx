
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import DashboardLayout from "../components/DashboardLayout";
import CourseCard from "../components/CourseCard";
import CourseForm from "../components/CourseForm";
import Toast from "../components/Toast";

import { courses as initialCourses } from "../data/courseData";
import { assignments as initialAssignments } from "../data/seedData";

import {
  getStoredData,
  saveStoredData,
} from "../services/storageService";

export default function ProfessorDashboard() {
  const { user } = useAuth();

  const [courses, setCourses] = useState(() =>
    getStoredData("joineazy_courses", initialCourses)
  );

  const [assignments, setAssignments] = useState(() =>
    getStoredData("joineazy_assignments", initialAssignments)
  );

  const [groups, setGroups] = useState(() =>
    getStoredData("joineazy_groups", [])
  );

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    saveStoredData("joineazy_courses", courses);
  }, [courses]);

  useEffect(() => {
    saveStoredData("joineazy_assignments", assignments);
  }, [assignments]);

  useEffect(() => {
    saveStoredData("joineazy_groups", groups);
  }, [groups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  function showToast(message, type = "success") {
    setToast({
      id: crypto.randomUUID(),
      message,
      type,
    });
  }

  const myCourses = courses.filter(
    (course) => course.professorId === user.id
  );

  const myAssignments = assignments.filter((assignment) =>
    myCourses.some(
      (course) =>
        course.id === assignment.courseId ||
        (course.assignmentIds || []).includes(assignment.id)
    )
  );

  const totalStudents = new Set(
    myCourses.flatMap(
      (course) => course.enrolledStudentIds || []
    )
  ).size;

  function getAssignmentGroups(assignment) {
    const courseGroups = groups.filter(
      (group) =>
        group.courseId === assignment.courseId &&
        group.memberIds?.length > 0
    );

    if (Array.isArray(assignment.assignedGroupIds)) {
      return courseGroups.filter((group) =>
        assignment.assignedGroupIds.includes(group.id)
      );
    }

    return courseGroups;
  }

  function isGroupSubmitted(assignment, groupId) {
    return (
      assignment.groupAcknowledgements?.[groupId]?.status ===
      "submitted"
    );
  }

  function isStudentSubmitted(assignment, studentId) {
    return (
      assignment.acknowledgements?.[studentId]?.status ===
        "submitted" ||
      assignment.submissions?.[studentId] === "submitted"
    );
  }

  function getSubmissionStats(assignment) {
    if (assignment.submissionType === "Group") {
      const assignedGroups = getAssignmentGroups(assignment);

      const submitted = assignedGroups.filter((group) =>
        isGroupSubmitted(assignment, group.id)
      ).length;

      return {
        total: assignedGroups.length,
        submitted,
        pending: assignedGroups.length - submitted,
        unit: "groups",
      };
    }

    const assignedStudentIds =
      assignment.assignedStudentIds || [];

    const submitted = assignedStudentIds.filter((studentId) =>
      isStudentSubmitted(assignment, studentId)
    ).length;

    return {
      total: assignedStudentIds.length,
      submitted,
      pending: assignedStudentIds.length - submitted,
      unit: "students",
    };
  }

  function getAssignmentDeadline(assignment) {
    if (assignment.deadline) {
      return new Date(assignment.deadline);
    }

    if (assignment.dueDate) {
      return new Date(`${assignment.dueDate}T23:59:59`);
    }

    return null;
  }

  function isAssignmentOverdue(assignment) {
    if (!currentTime) {
      return false;
    }

    const deadline = getAssignmentDeadline(assignment);

    if (!deadline || Number.isNaN(deadline.getTime())) {
      return false;
    }

    const stats = getSubmissionStats(assignment);

    return (
      deadline.getTime() < currentTime &&
      stats.pending > 0
    );
  }

  const totalSubmissions = myAssignments.reduce(
    (total, assignment) =>
      total + getSubmissionStats(assignment).submitted,
    0
  );

  const totalPending = myAssignments.reduce(
    (total, assignment) =>
      total + getSubmissionStats(assignment).pending,
    0
  );

  const overdueAssignments = myAssignments.filter(
    isAssignmentOverdue
  );

  const totalAssignmentUnits = myAssignments.reduce(
    (total, assignment) =>
      total + getSubmissionStats(assignment).total,
    0
  );

  const overallProgress = totalAssignmentUnits
    ? Math.round(
        (totalSubmissions / totalAssignmentUnits) * 100
      )
    : 0;

  const statistics = [
    {
      title: "Total Courses",
      value: myCourses.length,
      icon: "📚",
      description: "Courses you teach",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: "👥",
      description: "Unique enrolled students",
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Assignments",
      value: myAssignments.length,
      icon: "📝",
      description: "Created assignments",
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "Submissions",
      value: totalSubmissions,
      icon: "✓",
      description: "Confirmed submissions",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Pending",
      value: totalPending,
      icon: "⏳",
      description: "Awaiting submissions",
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Overdue",
      value: overdueAssignments.length,
      icon: "⚠️",
      description: "Assignments past deadline",
      color: "bg-red-50 text-red-700",
    },
  ];

  function handleCreateCourse(formData) {
    const duplicate = courses.some(
      (course) =>
        course.code?.toLowerCase() ===
        formData.code.trim().toLowerCase()
    );

    if (duplicate) {
      showToast(
        "A course with this code already exists.",
        "error"
      );
      return;
    }

    const newCourse = {
      id: `course-${crypto.randomUUID()}`,
      ...formData,
      code: formData.code.trim(),
      title: formData.title.trim(),
      professorId: user.id,
      enrolledStudentIds: [],
      assignmentIds: [],
      semester: "Fall 2026",
      color: "blue",
    };

    setCourses((previous) => [
      ...previous,
      newCourse,
    ]);

    setShowCourseForm(false);
    showToast("Course created successfully.");
  }

  function handleDeleteCourse(courseId) {
    const confirmed = window.confirm(
      "Delete this course? Its associated assignments and groups will also be removed."
    );

    if (!confirmed) {
      return;
    }

    const course = courses.find(
      (item) => item.id === courseId
    );

    if (!course || course.professorId !== user.id) {
      return;
    }

    setCourses((previous) =>
      previous.filter((item) => item.id !== courseId)
    );

    setAssignments((previous) =>
      previous.filter(
        (assignment) =>
          assignment.courseId !== courseId &&
          !(course.assignmentIds || []).includes(assignment.id)
      )
    );

    setGroups((previous) =>
      previous.filter(
        (group) => group.courseId !== courseId
      )
    );

    showToast("Course and its related data were deleted.");
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not specified";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const recentAssignments = [...myAssignments]
    .sort((a, b) => {
      const dateA =
        getAssignmentDeadline(a)?.getTime() || Infinity;

      const dateB =
        getAssignmentDeadline(b)?.getTime() || Infinity;

      return dateA - dateB;
    })
    .slice(0, 5);

  return (
    <DashboardLayout role="professor">
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
        />
      )}

      <div className="space-y-10">
        <section className="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-100">
              PROFESSOR WORKSPACE
            </p>

            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              Welcome back, {user.name}!
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
              Manage your courses, monitor student submissions
              and keep track of assignment progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowCourseForm((previous) => !previous)
            }
            className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            {showCourseForm ? "Close Form" : "+ Create Course"}
          </button>
        </section>

        {showCourseForm && (
          <section>
            <CourseForm
              onSave={handleCreateCourse}
              onCancel={() => setShowCourseForm(false)}
            />
          </section>
        )}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Dashboard Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A summary of your courses and student activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statistics.map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${stat.color}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-bold text-slate-900">
                  {stat.value}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Overall Submission Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {totalSubmissions} of {totalAssignmentUnits} assigned students/groups have submitted.
                </p>
              </div>

              <span className="text-3xl font-bold text-green-600">
                {overallProgress}%
              </span>
            </div>

            <div
              className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={overallProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall submission progress"
            >
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
              <span>{totalSubmissions} submitted</span>
              <span>{totalPending} pending</span>
            </div>
          </div>
        </section>

        <section id="courses" className="scroll-mt-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your teaching courses and enrolled students.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {myCourses.length} Courses
            </span>
          </div>

          {myCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
              <div className="text-4xl">📚</div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No courses created yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first course to get started.
              </p>

              <button
                type="button"
                onClick={() => setShowCourseForm(true)}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="min-w-0"
                >
                  <CourseCard
                    course={course}
                    role="professor"
                  />

                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete course
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="assignments" className="scroll-mt-6 pb-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Assignment Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor individual and group assignment submissions.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {myAssignments.length === 0 ? (
              <div className="p-8 text-center sm:p-10">
                <div className="text-4xl">📝</div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  No assignments available
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Create an assignment inside one of your courses to see its progress here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAssignments.map((assignment) => {
                  const stats = getSubmissionStats(assignment);

                  const progress = stats.total
                    ? Math.round(
                        (stats.submitted / stats.total) * 100
                      )
                    : 0;

                  const overdue = isAssignmentOverdue(assignment);

                  const course = myCourses.find(
                    (item) =>
                      item.id === assignment.courseId ||
                      (item.assignmentIds || []).includes(assignment.id)
                  );

                  return (
                    <article
                      key={assignment.id}
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold text-slate-800">
                            {assignment.title}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {course?.title || "Course"}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {assignment.submissionType === "Group"
                              ? "Group assignment"
                              : "Individual assignment"}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            Deadline:{" "}
                            <span className="font-medium text-slate-700">
                              {formatDate(
                                assignment.deadline || assignment.dueDate
                              )}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <div className="sm:text-right">
                            <p className="text-lg font-bold text-blue-600">
                              {stats.submitted}/{stats.total}
                            </p>

                            <p className="text-xs text-slate-400">
                              {stats.unit} submitted
                            </p>
                          </div>

                          {overdue ? (
                            <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                              Overdue
                            </span>
                          ) : stats.total > 0 && stats.pending === 0 ? (
                            <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                              Completed
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                        <span>{progress}% completed</span>

                        <span>
                          {stats.pending} {stats.unit} pending
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {myAssignments.length > 5 && (
            <p className="mt-3 text-right text-xs text-slate-400">
              Showing the 5 assignments with the nearest deadlines.
            </p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
