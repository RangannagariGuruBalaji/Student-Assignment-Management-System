
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import DashboardLayout from "../components/DashboardLayout";
import CourseCard from "../components/CourseCard";
import Toast from "../components/Toast";

import { courses as initialCourses } from "../data/courseData";
import { assignments as initialAssignments } from "../data/seedData";

import {
  getStoredData,
  saveStoredData,
} from "../services/storageService";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [courses, setCourses] = useState(() =>
    getStoredData("joineazy_courses", initialCourses)
  );

  const [assignments] = useState(() =>
    getStoredData("joineazy_assignments", initialAssignments)
  );

  const [groups] = useState(() =>
    getStoredData("joineazy_groups", [])
  );

  const [currentTime, setCurrentTime] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    saveStoredData("joineazy_courses", courses);
  }, [courses]);

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

  const myCourses = courses.filter((course) =>
    (course.enrolledStudentIds || []).includes(user.id)
  );

  const availableCourses = courses.filter(
    (course) =>
      !(course.enrolledStudentIds || []).includes(user.id)
  );

  const myGroups = groups.filter((group) =>
    group.memberIds?.includes(user.id)
  );

  function getMyGroup(courseId) {
    return myGroups.find(
      (group) => group.courseId === courseId
    );
  }

  function isGroupAssignmentAssigned(assignment, courseId) {
    const myGroup = getMyGroup(courseId);

    if (!myGroup) {
      return false;
    }

    if (!Array.isArray(assignment.assignedGroupIds)) {
      return true;
    }

    return assignment.assignedGroupIds.includes(myGroup.id);
  }

  function getCourseAssignments(course) {
    return assignments.filter((assignment) => {
      const belongsToCourse =
        assignment.courseId === course.id ||
        (course.assignmentIds || []).includes(assignment.id);

      if (!belongsToCourse) {
        return false;
      }

      if (assignment.submissionType === "Group") {
        return isGroupAssignmentAssigned(
          assignment,
          course.id
        );
      }

      return (
        assignment.assignedStudentIds?.includes(user.id) ||
        false
      );
    });
  }

  const myAssignments = myCourses.flatMap((course) =>
    getCourseAssignments(course).map((assignment) => ({
      ...assignment,
      courseName: course.title,
      courseId: course.id,
    }))
  );

  function isAssignmentSubmitted(assignment) {
    if (assignment.submissionType === "Group") {
      const myGroup = getMyGroup(assignment.courseId);

      if (!myGroup) {
        return false;
      }

      return (
        assignment.groupAcknowledgements?.[myGroup.id]?.status ===
        "submitted"
      );
    }

    return (
      assignment.acknowledgements?.[user.id]?.status ===
        "submitted" ||
      assignment.submissions?.[user.id] === "submitted"
    );
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
    if (isAssignmentSubmitted(assignment) || !currentTime) {
      return false;
    }

    const deadline = getAssignmentDeadline(assignment);

    if (!deadline || Number.isNaN(deadline.getTime())) {
      return false;
    }

    return deadline.getTime() < currentTime;
  }

  const submittedCount = myAssignments.filter(
    isAssignmentSubmitted
  ).length;

  const pendingCount = myAssignments.length - submittedCount;

  const overdueCount = myAssignments.filter(
    isAssignmentOverdue
  ).length;

  const progress = myAssignments.length
    ? Math.round(
        (submittedCount / myAssignments.length) * 100
      )
    : 0;

  function handleEnroll(courseId) {
    const alreadyEnrolled = myCourses.some(
      (course) => course.id === courseId
    );

    if (alreadyEnrolled) {
      showToast("You are already enrolled in this course.", "info");
      return;
    }

    setCourses((previous) =>
      previous.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          enrolledStudentIds: [
            ...new Set([
              ...(course.enrolledStudentIds || []),
              user.id,
            ]),
          ],
        };
      })
    );

    showToast("You have successfully enrolled in the course.");
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

  const statistics = [
    {
      title: "My Courses",
      value: myCourses.length,
      icon: "📚",
      description: "Enrolled courses",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Assignments",
      value: myAssignments.length,
      icon: "📝",
      description: "Assigned to you",
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Submitted",
      value: submittedCount,
      icon: "✓",
      description: "Completed assignments",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: "⏳",
      description: "Awaiting submission",
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Overdue",
      value: overdueCount,
      icon: "⚠️",
      description: "Past deadline",
      color: "bg-red-50 text-red-700",
    },
  ];

  return (
    <DashboardLayout role="student">
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
        />
      )}

      <div className="space-y-10">

        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-semibold tracking-wide text-green-100">
            STUDENT WORKSPACE
          </p>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Welcome back, {user.name}!
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base">
            Manage your courses, stay updated with deadlines and keep
            track of your assignment progress.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#courses"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
            >
              Explore My Courses
            </a>

            <a
              href="#assignments"
              className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Assignments
            </a>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Your Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick look at your academic activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                  My Overall Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {submittedCount} of {myAssignments.length} assignments acknowledged.
                </p>
              </div>

              <span className="text-3xl font-bold text-green-600">
                {progress}%
              </span>
            </div>

            <div
              className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall assignment progress"
            >
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
              <span>{submittedCount} completed</span>
              <span>{pendingCount} remaining</span>
            </div>
          </div>
        </section>

        <section id="courses" className="scroll-mt-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Enrolled Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View your courses and track your progress.
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
              {myCourses.length} Enrolled
            </span>
          </div>

          {myCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
              <div className="text-4xl">📚</div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No enrolled courses yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Explore the available courses below and enroll to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {myCourses.map((course) => {
                const courseAssignments =
                  getCourseAssignments(course);

                const completed = courseAssignments.filter(
                  isAssignmentSubmitted
                ).length;

                const courseProgress = courseAssignments.length
                  ? Math.round(
                      (completed / courseAssignments.length) * 100
                    )
                  : 0;

                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    role="student"
                    progress={courseProgress}
                    isEnrolled
                  />
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Explore Available Courses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enroll in additional courses offered by your professors.
            </p>
          </div>

          {availableCourses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center">
              <div className="text-3xl">🎉</div>

              <p className="mt-3 font-semibold text-slate-800">
                You are enrolled in all available courses.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                You are all caught up with the available courses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {availableCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  role="student"
                  isEnrolled={false}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          )}
        </section>

        <section id="assignments" className="scroll-mt-6 pb-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Recent Assignments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Check your assignment deadlines and submission status.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {myAssignments.length} Assignments
            </span>
          </div>

          {myAssignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="text-4xl">📝</div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No assignments available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your assignments will appear here when they are assigned.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {[...myAssignments]
                .sort((a, b) => {
                  const dateA =
                    getAssignmentDeadline(a)?.getTime() || Infinity;

                  const dateB =
                    getAssignmentDeadline(b)?.getTime() || Infinity;

                  return dateA - dateB;
                })
                .map((assignment) => {
                  const submitted =
                    isAssignmentSubmitted(assignment);

                  const overdue =
                    isAssignmentOverdue(assignment);

                  const course = myCourses.find(
                    (item) => item.id === assignment.courseId
                  );

                  const myGroup = getMyGroup(assignment.courseId);

                  const groupAcknowledgement = myGroup
                    ? assignment.groupAcknowledgements?.[myGroup.id]
                    : null;

                  const individualAcknowledgement =
                    assignment.acknowledgements?.[user.id];

                  const status = submitted
                    ? "Submitted"
                    : overdue
                      ? "Overdue"
                      : "Pending";

                  const statusStyle = submitted
                    ? "bg-green-50 text-green-700 ring-green-200"
                    : overdue
                      ? "bg-red-50 text-red-700 ring-red-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200";

                  const isGroup =
                    assignment.submissionType === "Group";

                  return (
                    <article
                      key={assignment.id}
                      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                            isGroup
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {isGroup ? "👥" : "📝"}
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
                              {assignment.title}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {assignment.courseName}
                            </p>
                          </div>
                        </div>

                        <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyle}`}>
                          {submitted ? "✓ " : ""}
                          {status}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          isGroup
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}>
                          {isGroup ? "Group Assignment" : "Individual Assignment"}
                        </span>

                        {isGroup && myGroup && (
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            {myGroup.name}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                            📅
                          </span>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-400">
                              Submission Deadline
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                              {formatDate(
                                assignment.deadline || assignment.dueDate
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {submitted && (
                        <div className="mt-3 rounded-xl border border-green-100 bg-green-50 p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-green-700">✓</span>

                            <p className="text-sm font-semibold text-green-800">
                              Assignment acknowledged
                            </p>
                          </div>

                          <p className="mt-2 text-xs text-green-700">
                            Acknowledged on:{" "}
                            {formatDate(
                              isGroup
                                ? groupAcknowledgement?.acknowledgedAt
                                : individualAcknowledgement?.acknowledgedAt
                            )}
                          </p>
                        </div>
                      )}

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 mt-5">
                        <p className="text-xs text-slate-400">
                          {overdue && !submitted
                            ? "Please check this overdue assignment."
                            : submitted
                              ? "Your acknowledgement is recorded."
                              : "Waiting for your acknowledgement."}
                        </p>

                        {course && (
                          <Link
                            to={`/${user.role}/courses/${course.id}/assignments`}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            View Course
                            <span aria-hidden="true">→</span>
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
}
