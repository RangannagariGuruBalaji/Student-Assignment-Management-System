
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStoredData } from "../services/storageService";
import { courses as initialCourses } from "../data/courseData";
import { students } from "../data/seedData";

export default function MyGroupsSection() {
  const { user } = useAuth();

  const groups = getStoredData("joineazy_groups", []);
  const courses = getStoredData("joineazy_courses", initialCourses);
  const assignments = getStoredData("joineazy_assignments", []);

  const myGroups = groups.filter((group) =>
    group.memberIds?.includes(user.id)
  );

  function getStudentName(studentId) {
    if (studentId === user.id) {
      return user.name;
    }

    return (
      students.find((student) => student.id === studentId)?.name ||
      studentId
    );
  }

  function getGroupAssignments(group, course) {
    return assignments.filter((assignment) => {
      const belongsToCourse =
        assignment.courseId === course.id ||
        (course.assignmentIds || []).includes(assignment.id);

      const isGroupAssignment =
        assignment.submissionType === "Group";

      const isAssignedToGroup =
        !Array.isArray(assignment.assignedGroupIds) ||
        assignment.assignedGroupIds.includes(group.id);

      return (
        belongsToCourse &&
        isGroupAssignment &&
        isAssignedToGroup
      );
    });
  }

  function isGroupAssignmentSubmitted(assignment, groupId) {
    return (
      assignment.groupAcknowledgements?.[groupId]?.status ===
      "submitted"
    );
  }

  return (
    <section id="groups" className="scroll-mt-24">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          My Groups
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View your groups, group leaders, teammates and assignment progress.
        </p>
      </div>

      {myGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="text-4xl">👥</div>

          <h3 className="mt-4 font-semibold text-slate-800">
            You haven't joined any groups yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Visit your course pages to create or join a group.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {myGroups.map((group) => {
            const course = courses.find(
              (item) => item.id === group.courseId
            );

            const groupAssignments = course
              ? getGroupAssignments(group, course)
              : [];

            const submittedCount = groupAssignments.filter(
              (assignment) =>
                isGroupAssignmentSubmitted(assignment, group.id)
            ).length;

            const pendingCount =
              groupAssignments.length - submittedCount;

            const progress = groupAssignments.length
              ? Math.round(
                  (submittedCount / groupAssignments.length) * 100
                )
              : 0;

            return (
              <article
                key={group.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {group.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {course?.title || "Course"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {group.memberIds?.length || 0} Members
                  </span>
                </div>

                <div className="mt-5 rounded-xl bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-700">
                    GROUP LEADER
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {getStudentName(group.leaderId)}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Team Members
                  </p>

                  <div className="space-y-3">
                    {(group.memberIds || []).map((memberId) => (
                      <div
                        key={memberId}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {getStudentName(memberId)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {getStudentName(memberId)}
                          </p>

                          {memberId === group.leaderId && (
                            <p className="text-xs text-amber-600">
                              Team Leader
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h4 className="font-semibold text-slate-800">
                    Group Assignment Progress
                  </h4>

                  {groupAssignments.length === 0 ? (
                    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                      No group assignments available yet.
                    </p>
                  ) : (
                    <>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-green-50 p-3">
                          <p className="text-xs text-green-700">
                            Submitted
                          </p>

                          <p className="mt-1 text-2xl font-bold text-green-700">
                            {submittedCount}
                          </p>
                        </div>

                        <div className="rounded-xl bg-amber-50 p-3">
                          <p className="text-xs text-amber-700">
                            Pending
                          </p>

                          <p className="mt-1 text-2xl font-bold text-amber-700">
                            {pendingCount}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-slate-500">
                            Overall progress
                          </span>

                          <span className="font-semibold text-slate-700">
                            {progress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {groupAssignments.map((assignment) => {
                          const submitted =
                            isGroupAssignmentSubmitted(
                              assignment,
                              group.id
                            );

                          return (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between gap-3"
                            >
                              <p className="min-w-0 text-sm font-medium text-slate-700">
                                {assignment.title}
                              </p>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  submitted
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {submitted ? "Submitted" : "Pending"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {course && (
                  <Link
                    to={`/student/courses/${course.id}/assignments`}
                    className="mt-6 block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Group Course →
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
