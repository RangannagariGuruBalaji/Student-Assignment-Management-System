
import { useState } from "react";

export default function SubmissionTracking({
  assignment,
  students,
  groups = [],
}) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const isGroupAssignment = assignment.submissionType === "Group";

  const courseGroups = groups.filter((group) => {
    const belongsToCourse =
      group.courseId === assignment.courseId &&
      group.memberIds?.length > 0;

    const isAssigned =
      !Array.isArray(assignment.assignedGroupIds) ||
      assignment.assignedGroupIds.includes(group.id);

    return belongsToCourse && isAssigned;
  });

  function getStudentName(studentId) {
    return (
      students.find((student) => student.id === studentId)?.name ||
      "Unknown student"
    );
  }

  function isGroupSubmitted(group) {
    return (
      assignment.groupAcknowledgements?.[group.id]?.status ===
      "submitted"
    );
  }

  const assignedStudents = (
    assignment.assignedStudentIds || []
  ).map((studentId) => {
    const student = students.find(
      (item) => item.id === studentId
    );

    return student || {
      id: studentId,
      name: studentId,
    };
  });

  function isStudentSubmitted(studentId) {
    const acknowledgement =
      assignment.acknowledgements?.[studentId];

    const oldSubmission =
      assignment.submissions?.[studentId];

    return (
      acknowledgement?.status === "submitted" ||
      oldSubmission === "submitted"
    );
  }

  const totalCount = isGroupAssignment
    ? courseGroups.length
    : assignedStudents.length;

  const submittedCount = isGroupAssignment
    ? courseGroups.filter(isGroupSubmitted).length
    : assignedStudents.filter((student) =>
        isStudentSubmitted(student.id)
      ).length;

  const pendingCount = totalCount - submittedCount;

  const progress =
    totalCount > 0
      ? Math.round((submittedCount / totalCount) * 100)
      : 0;

  const filteredStudents = assignedStudents
    .filter((student) =>
      String(student.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((student) => {
      if (filter === "submitted") {
        return isStudentSubmitted(student.id);
      }

      if (filter === "pending") {
        return !isStudentSubmitted(student.id);
      }

      return true;
    });

  const filteredGroups = courseGroups
    .filter((group) => {
      const leaderName = getStudentName(group.leaderId);

      const memberNames = group.memberIds
        .map(getStudentName)
        .join(" ");

      const searchableText =
        `${group.name} ${leaderName} ${memberNames}`;

      return searchableText
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    })
    .filter((group) => {
      if (filter === "submitted") {
        return isGroupSubmitted(group);
      }

      if (filter === "pending") {
        return !isGroupSubmitted(group);
      }

      return true;
    });

  function formatDate(dateValue) {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN");
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">
            {isGroupAssignment
              ? "Group Submission Tracking"
              : "Student Submission Tracking"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {isGroupAssignment
              ? "Monitor submission progress across assigned groups."
              : "Monitor individual student submission progress."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((previous) => !previous)}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          {showDetails ? "Hide Details ↑" : "View Details ↓"}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            {isGroupAssignment ? "Assigned Groups" : "Total Students"}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalCount}
          </p>
        </div>

        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-xs text-green-700">
            Submitted
          </p>

          <p className="mt-2 text-2xl font-bold text-green-700">
            {submittedCount}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-xs text-amber-700">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-700">
            {pendingCount}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold text-slate-700">
            Overall Submission Progress
          </span>

          <span className="font-bold text-green-600">
            {progress}%
          </span>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Assignment submission progress"
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showDetails && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <div>
            <label
              htmlFor="submission-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {isGroupAssignment ? "Search Group" : "Search Student"}
            </label>

            <input
              id="submission-search"
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder={
                isGroupAssignment
                  ? "Search by group or member name..."
                  : "Search by student name..."
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => setFilter("submitted")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                filter === "submitted"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Submitted ({submittedCount})
            </button>

            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                filter === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>

          {isGroupAssignment ? (
            <div className="mt-5 space-y-3">
              {filteredGroups.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                  No matching assigned groups found.
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const submitted = isGroupSubmitted(group);

                  const acknowledgement =
                    assignment.groupAcknowledgements?.[group.id];

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {group.name}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            Leader: {getStudentName(group.leaderId)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {group.memberIds.length} member(s)
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            submitted
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {submitted ? "✓ Submitted" : "Pending"}
                        </span>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Group Members
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {group.memberIds.map((memberId) => (
                            <span
                              key={memberId}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                            >
                              {getStudentName(memberId)}
                              {memberId === group.leaderId
                                ? " (Leader)"
                                : ""}
                            </span>
                          ))}
                        </div>
                      </div>

                      {acknowledgement?.acknowledgedAt && (
                        <div className="mt-3 rounded-lg bg-green-50 p-3">
                          <p className="text-xs text-green-700">
                            Acknowledged by{" "}
                            {getStudentName(
                              acknowledgement.acknowledgedBy
                            )}
                          </p>

                          <p className="mt-1 text-xs text-green-700">
                            Date:{" "}
                            {formatDate(
                              acknowledgement.acknowledgedAt
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                  No matching students found.
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const submitted = isStudentSubmitted(student.id);

                  const acknowledgement =
                    assignment.acknowledgements?.[student.id];

                  return (
                    <div
                      key={student.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {String(student.name)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {student.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {student.id}
                          </p>

                          {acknowledgement?.acknowledgedAt && (
                            <p className="mt-1 text-xs text-slate-500">
                              Acknowledged:{" "}
                              {formatDate(
                                acknowledgement.acknowledgedAt
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          submitted
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {submitted ? "✓ Submitted" : "Pending"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
