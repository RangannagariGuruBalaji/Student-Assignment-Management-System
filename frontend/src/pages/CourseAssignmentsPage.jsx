
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import DashboardLayout from "../components/DashboardLayout";
import AssignmentForm from "../components/AssignmentForm";
import SubmissionTracking from "../components/SubmissionTracking";
import GroupManagement from "../components/GroupManagement";
import Toast from "../components/Toast";

import {
  students,
  assignments as initialAssignments,
} from "../data/seedData";

import { courses as initialCourses } from "../data/courseData";

import {
  getStoredData,
  saveStoredData,
} from "../services/storageService";

export default function CourseAssignmentsPage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const isProfessor = user.role === "professor";

  const [courses, setCourses] = useState(() =>
    getStoredData("joineazy_courses", initialCourses)
  );

  const [assignments, setAssignments] = useState(() =>
    getStoredData("joineazy_assignments", initialAssignments)
  );

  const [groups, setGroups] = useState(() =>
    getStoredData("joineazy_groups", [])
  );

  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);

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

  const course = courses.find((item) => item.id === courseId);

  const hasAccess = course && (
    isProfessor
      ? course.professorId === user.id
      : course.enrolledStudentIds?.includes(user.id)
  );

  if (!hasAccess) {
    return (
      <Navigate
        to={`/${user.role}/dashboard`}
        replace
      />
    );
  }

  const courseGroups = groups.filter(
    (group) =>
      group.courseId === courseId &&
      group.memberIds?.length > 0
  );

  const myGroup = courseGroups.find((group) =>
    group.memberIds.includes(user.id)
  );

  const courseAssignments = assignments.filter((assignment) => {
    const belongsToCourse =
      assignment.courseId === courseId ||
      (course.assignmentIds || []).includes(assignment.id);

    if (!belongsToCourse) {
      return false;
    }

    if (
      isProfessor ||
      assignment.submissionType !== "Group" ||
      !Array.isArray(assignment.assignedGroupIds)
    ) {
      return true;
    }

    return Boolean(
      myGroup &&
      assignment.assignedGroupIds.includes(myGroup.id)
    );
  });

  function getAssignmentGroups(assignment) {
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
    if (assignment.submissionType === "Group") {
      const studentGroup = courseGroups.find((group) =>
        group.memberIds.includes(studentId)
      );

      return Boolean(
        studentGroup &&
        isGroupSubmitted(assignment, studentGroup.id)
      );
    }

    return (
      assignment.acknowledgements?.[studentId]?.status === "submitted" ||
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

    const assignedStudentIds = assignment.assignedStudentIds || [];

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

  function isAssignmentOverdue(assignment) {
    const deadline = assignment.deadline
      ? new Date(assignment.deadline)
      : assignment.dueDate
        ? new Date(`${assignment.dueDate}T23:59`)
        : null;

    if (!deadline || Number.isNaN(deadline.getTime())) {
      return false;
    }

    if (!currentTime || deadline.getTime() >= currentTime) {
      return false;
    }

    if (isProfessor) {
      return getSubmissionStats(assignment).pending > 0;
    }

    return !isStudentSubmitted(assignment, user.id);
  }

  function getAssignmentStatus(assignment) {
    if (isAssignmentOverdue(assignment)) {
      return "overdue";
    }

    if (!isProfessor) {
      return isStudentSubmitted(assignment, user.id)
        ? "submitted"
        : "pending";
    }

    const stats = getSubmissionStats(assignment);

    if (stats.total > 0 && stats.submitted === stats.total) {
      return "completed";
    }

    return "pending";
  }

  const filteredAssignments = courseAssignments
    .filter((assignment) =>
      assignment.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((assignment) => {
      if (statusFilter === "all") {
        return true;
      }

      if (statusFilter === "overdue") {
        return isAssignmentOverdue(assignment);
      }

      const status = getAssignmentStatus(assignment);

      if (isProfessor) {
        if (statusFilter === "completed") {
          return status === "completed";
        }

        if (statusFilter === "pending") {
          return status === "pending";
        }
      } else {
        if (statusFilter === "submitted") {
          return status === "submitted";
        }

        if (statusFilter === "pending") {
          return status === "pending";
        }
      }

      return true;
    });

  function handleSaveAssignment(formData) {
    const assignedStudentIds = [
      ...(course.enrolledStudentIds || []),
    ];

    if (editingAssignment) {
      setAssignments((previous) =>
        previous.map((assignment) => {
          if (assignment.id !== editingAssignment.id) {
            return assignment;
          }

          const updatedSubmissions = {
            ...(assignment.submissions || {}),
          };

          assignedStudentIds.forEach((studentId) => {
            if (!(studentId in updatedSubmissions)) {
              updatedSubmissions[studentId] = "not_submitted";
            }
          });

          return {
            ...assignment,
            ...formData,
            assignedStudentIds,
            submissions: updatedSubmissions,
          };
        })
      );

      showToast("Assignment updated successfully.");
    } else {
      const newAssignment = {
        id: `assignment-${crypto.randomUUID()}`,
        ...formData,
        courseId,
        createdBy: user.id,
        assignedStudentIds,
        submissions: Object.fromEntries(
          assignedStudentIds.map((studentId) => [
            studentId,
            "not_submitted",
          ])
        ),
        acknowledgements: {},
        groupAcknowledgements: {},
      };

      setAssignments((previous) => [
        ...previous,
        newAssignment,
      ]);

      setCourses((previous) =>
        previous.map((item) =>
          item.id === courseId
            ? {
                ...item,
                assignmentIds: [
                  ...new Set([
                    ...(item.assignmentIds || []),
                    newAssignment.id,
                  ]),
                ],
              }
            : item
        )
      );

      showToast("Assignment created successfully.");
    }

    setShowForm(false);
    setEditingAssignment(null);
  }

  function handleEdit(assignment) {
    setEditingAssignment(assignment);
    setShowForm(true);
  }

  function handleDelete(assignmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) return;

    setAssignments((previous) =>
      previous.filter(
        (assignment) => assignment.id !== assignmentId
      )
    );

    setCourses((previous) =>
      previous.map((item) =>
        item.id === courseId
          ? {
              ...item,
              assignmentIds: (
                item.assignmentIds || []
              ).filter((id) => id !== assignmentId),
            }
          : item
      )
    );

    showToast("Assignment deleted successfully.");
  }

  function handleAcknowledge(assignment) {
    if (assignment.submissionType === "Group") {
      if (!myGroup) {
        showToast(
          "Create or join a group before acknowledging this assignment.",
          "error"
        );
        return;
      }

      if (
        Array.isArray(assignment.assignedGroupIds) &&
        !assignment.assignedGroupIds.includes(myGroup.id)
      ) {
        showToast("Your group is not assigned this assignment.", "error");
        return;
      }

      if (myGroup.leaderId !== user.id) {
        showToast(
          "Only your group leader can acknowledge this assignment.",
          "error"
        );
        return;
      }

      if (isGroupSubmitted(assignment, myGroup.id)) {
        return;
      }

      const confirmed = window.confirm(
        "Are you sure your group has submitted this assignment?"
      );

      if (!confirmed) return;

      const timestamp = new Date().toISOString();

      setAssignments((previous) =>
        previous.map((item) =>
          item.id === assignment.id
            ? {
                ...item,
                groupAcknowledgements: {
                  ...(item.groupAcknowledgements || {}),
                  [myGroup.id]: {
                    status: "submitted",
                    acknowledgedBy: user.id,
                    acknowledgedAt: timestamp,
                  },
                },
              }
            : item
        )
      );

      showToast(
        "Your group submission acknowledgement was saved."
      );

      return;
    }

    if (isStudentSubmitted(assignment, user.id)) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you have submitted this assignment?"
    );

    if (!confirmed) return;

    const timestamp = new Date().toISOString();

    setAssignments((previous) =>
      previous.map((item) =>
        item.id === assignment.id
          ? {
              ...item,
              acknowledgements: {
                ...(item.acknowledgements || {}),
                [user.id]: {
                  status: "submitted",
                  acknowledgedAt: timestamp,
                },
              },
              submissions: {
                ...(item.submissions || {}),
                [user.id]: "submitted",
              },
            }
          : item
      )
    );

    showToast("Your assignment acknowledgement was saved.");
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

  return (
    <DashboardLayout role={user.role}>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
        />
      )}

      <Link
        to={`/${user.role}/dashboard`}
        className="text-sm font-semibold text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <span className="text-xs font-bold text-blue-600">
          {course.code}
        </span>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          {course.title}
        </h1>

        <p className="mt-3 text-slate-500">
          {course.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            {course.semester || "Fall 2026"}
          </span>

          <span className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
            {(course.enrolledStudentIds || []).length} Students
          </span>
        </div>
      </section>

      {!isProfessor && (
        <GroupManagement
          course={course}
          students={students}
          user={user}
          groups={groups}
          setGroups={setGroups}
        />
      )}

      <section className="mb-6 mt-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Course Assignments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredAssignments.length} assignments displayed.
          </p>
        </div>

        {isProfessor && (
          <button
            type="button"
            onClick={() => {
              setEditingAssignment(null);
              setShowForm(true);
            }}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            + Create Assignment
          </button>
        )}
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search Assignment
            </label>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by assignment title..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Filter by Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="all">All Assignments</option>

              {isProfessor ? (
                <>
                  <option value="completed">Fully Completed</option>
                  <option value="pending">Has Pending Submissions</option>
                  <option value="overdue">Overdue</option>
                </>
              ) : (
                <>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </>
              )}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}
          className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
        >
          Reset Filters
        </button>
      </section>

      {isProfessor && showForm && (
        <section className="mb-8">
          <AssignmentForm
            initialData={editingAssignment}
            groups={courseGroups}
            onSave={handleSaveAssignment}
            onCancel={() => {
              setShowForm(false);
              setEditingAssignment(null);
            }}
          />
        </section>
      )}

      {filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="text-4xl">📝</div>

          <h3 className="mt-4 font-semibold text-slate-800">
            No matching assignments
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredAssignments.map((assignment) => {
            const acknowledgement =
              assignment.acknowledgements?.[user.id];

            const groupAcknowledgement = myGroup
              ? assignment.groupAcknowledgements?.[myGroup.id]
              : null;

            const isSubmitted = isStudentSubmitted(
              assignment,
              user.id
            );

            const assignmentStatus =
              getAssignmentStatus(assignment);

            const stats = getSubmissionStats(assignment);

            const statusLabel = isProfessor
              ? assignmentStatus === "completed"
                ? "Completed"
                : assignmentStatus === "overdue"
                  ? "Overdue"
                  : "Pending"
              : assignmentStatus === "submitted"
                ? "Submitted"
                : assignmentStatus === "overdue"
                  ? "Overdue"
                  : "Pending";

            return (
              <article
                key={assignment.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-md"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900">
                      {assignment.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {assignment.description}
                    </p>
                  </div>

                  <span
                    className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      assignmentStatus === "overdue"
                        ? "bg-red-100 text-red-700"
                        : assignmentStatus === "completed" ||
                            assignmentStatus === "submitted"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Deadline
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {formatDate(
                        assignment.deadline || assignment.dueDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Submission Type
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {assignment.submissionType || "Individual"}
                    </p>
                  </div>
                </div>

                {isProfessor && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      {stats.unit === "groups"
                        ? "Group Submission Summary"
                        : "Student Submission Summary"}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {stats.submitted} of {stats.total}{" "}
                      {stats.unit} submitted
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {stats.pending} {stats.unit} pending
                    </p>
                  </div>
                )}

                {(assignment.oneDriveLink || assignment.driveLink) && (
                  <a
                    href={
                      assignment.oneDriveLink ||
                      assignment.driveLink
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Open OneDrive Resource ↗
                  </a>
                )}

                {isProfessor && (
                  <SubmissionTracking
                    assignment={assignment}
                    students={students}
                    groups={groups}
                  />
                )}

                {!isProfessor && (
                  <div className="mt-5">
                    {assignment.submissionType === "Group" ? (
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        {!myGroup ? (
                          <p className="text-sm text-blue-800">
                            Create or join a course group before acknowledging this assignment.
                          </p>
                        ) : groupAcknowledgement?.status === "submitted" ? (
                          <div>
                            <p className="text-sm font-semibold text-green-700">
                              ✓ Your group has acknowledged this assignment.
                            </p>

                            <p className="mt-2 text-xs text-green-700">
                              Acknowledged by{" "}
                              {students.find(
                                (student) =>
                                  student.id === groupAcknowledgement.acknowledgedBy
                              )?.name || "Group leader"}{" "}
                              on{" "}
                              {formatDate(
                                groupAcknowledgement.acknowledgedAt
                              )}
                            </p>
                          </div>
                        ) : myGroup.leaderId === user.id ? (
                          <button
                            type="button"
                            onClick={() => handleAcknowledge(assignment)}
                            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                          >
                            Acknowledge Group Submission
                          </button>
                        ) : (
                          <p className="text-sm text-blue-800">
                            Your group leader,{" "}
                            {students.find(
                              (student) => student.id === myGroup.leaderId
                            )?.name || "Group leader"}{" "}
                            must acknowledge this submission.
                          </p>
                        )}
                      </div>
                    ) : isSubmitted ? (
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-semibold text-green-700">
                          ✓ You have acknowledged this assignment.
                        </p>

                        <p className="mt-2 text-xs text-green-700">
                          Acknowledged on:{" "}
                          {acknowledgement?.acknowledgedAt
                            ? formatDate(acknowledgement.acknowledgedAt)
                            : "Previously submitted"}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(assignment)}
                        className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                      >
                        Yes, I have submitted
                      </button>
                    )}
                  </div>
                )}

                {isProfessor && (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() => handleEdit(assignment)}
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(assignment.id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
