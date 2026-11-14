
import { useState } from "react";

import Toast from "./Toast";

function GroupManagement({
  course,
  students,
  user,
  groups,
  setGroups,
}) {
  const [groupName, setGroupName] = useState("");
  const [toast, setToast] = useState(null);

  const courseGroups = groups.filter(
    (group) => group.courseId === course.id
  );

  const myGroup = courseGroups.find((group) =>
    group.memberIds.includes(user.id)
  );

  const isProfessor = user.role === "professor";

  const isEnrolled = course.enrolledStudentIds?.includes(user.id);

  function showMessage(message, type = "success") {
    setToast({
      id: crypto.randomUUID(),
      message,
      type,
    });
  }

  function getStudentName(studentId) {
    return (
      students.find((student) => student.id === studentId)?.name ||
      "Unknown student"
    );
  }

  function createGroup(event) {
    event.preventDefault();

    const name = groupName.trim();

    if (!name) {
      showMessage("Please enter a group name.", "error");
      return;
    }

    if (!isEnrolled) {
      showMessage(
        "You must be enrolled in this course.",
        "error"
      );
      return;
    }

    if (myGroup) {
      showMessage(
        "You are already a member of a group in this course.",
        "error"
      );
      return;
    }

    const newGroup = {
      id: `group-${crypto.randomUUID()}`,
      courseId: course.id,
      name,
      leaderId: user.id,
      memberIds: [user.id],
      createdAt: new Date().toISOString(),
    };

    setGroups((previousGroups) => [
      ...previousGroups,
      newGroup,
    ]);

    setGroupName("");

    showMessage("Your group has been created successfully.");
  }

  function joinGroup(groupId) {
    if (!isEnrolled) {
      showMessage(
        "You must be enrolled in this course.",
        "error"
      );
      return;
    }

    if (myGroup) {
      showMessage(
        "You are already a member of a group in this course.",
        "error"
      );
      return;
    }

    setGroups((previousGroups) =>
      previousGroups.map((group) => {
        if (
          group.id !== groupId ||
          group.memberIds.includes(user.id)
        ) {
          return group;
        }

        return {
          ...group,
          memberIds: [...group.memberIds, user.id],
        };
      })
    );

    showMessage("You joined the group successfully.");
  }

  if (!isProfessor && !isEnrolled) {
    return null;
  }

  return (
    <section className="relative mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
        />
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Course Groups
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a group or join an existing group for {course.title}.
        </p>
      </div>

      {!isProfessor && !myGroup && (
        <form
          onSubmit={createGroup}
          className="mb-6 rounded-xl bg-slate-50 p-4"
        >
          <h3 className="mb-3 font-semibold text-slate-800">
            Create a new group
          </h3>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={groupName}
              onChange={(event) =>
                setGroupName(event.target.value)
              }
              placeholder="Enter group name"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Group
            </button>
          </div>
        </form>
      )}

      {myGroup && !isProfessor && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800">
            You are a member of
          </p>

          <h3 className="mt-1 text-lg font-bold text-blue-950">
            {myGroup.name}
          </h3>

          <p className="mt-2 text-sm text-blue-800">
            Group leader: {getStudentName(myGroup.leaderId)}
          </p>

          <p className="mt-1 text-sm text-blue-800">
            Members: {myGroup.memberIds.length}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800">
          Available Groups ({courseGroups.length})
        </h3>

        {courseGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center">
            <p className="font-medium text-slate-600">
              No groups created yet
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Be the first to create a group.
            </p>
          </div>
        ) : (
          courseGroups.map((group) => {
            const isMember = group.memberIds.includes(user.id);

            return (
              <div
                key={group.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {group.name}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Leader: {getStudentName(group.leaderId)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {group.memberIds.length} member(s)
                    </p>
                  </div>

                  {!isProfessor && !myGroup && (
                    <button
                      type="button"
                      onClick={() => joinGroup(group.id)}
                      className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      Join Group
                    </button>
                  )}

                  {isMember && (
                    <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Joined
                    </span>
                  )}
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
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default GroupManagement;
