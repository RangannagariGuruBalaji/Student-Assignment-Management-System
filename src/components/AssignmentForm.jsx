
import { useState } from "react";

export default function AssignmentForm({
  onSave,
  onCancel,
  initialData,
  groups = [],
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    deadline: initialData?.deadline
      ? initialData.deadline.slice(0, 16)
      : initialData?.dueDate
        ? `${initialData.dueDate}T23:59`
        : "",
    oneDriveLink:
      initialData?.oneDriveLink ||
      initialData?.driveLink ||
      "",
    submissionType:
      initialData?.submissionType || "Individual",
    assignedGroupIds:
      initialData?.assignedGroupIds ||
      (initialData?.submissionType === "Group"
        ? groups.map((group) => group.id)
        : []),
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "submissionType" && value === "Individual"
        ? { assignedGroupIds: [] }
        : {}),
    }));

    setError("");
  }

  function handleGroupSelection(groupId) {
    setFormData((previous) => {
      const isSelected = previous.assignedGroupIds.includes(groupId);

      return {
        ...previous,
        assignedGroupIds: isSelected
          ? previous.assignedGroupIds.filter((id) => id !== groupId)
          : [...previous.assignedGroupIds, groupId],
      };
    });

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.deadline ||
      !formData.oneDriveLink.trim()
    ) {
      setError("Please complete all assignment fields.");
      return;
    }

    const deadlineDate = new Date(formData.deadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      setError("Please enter a valid deadline.");
      return;
    }

    if (deadlineDate.getTime() <= Date.now()) {
      setError("Please select a future deadline.");
      return;
    }

    try {
      const link = new URL(formData.oneDriveLink);

      if (link.protocol !== "https:") {
        setError("Please provide a valid HTTPS OneDrive link.");
        return;
      }
    } catch {
      setError("Please enter a valid OneDrive URL.");
      return;
    }

    if (
      formData.submissionType === "Group" &&
      formData.assignedGroupIds.length === 0
    ) {
      setError("Please select at least one group.");
      return;
    }

    onSave(formData);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-slate-900">
        {initialData ? "Edit Assignment" : "Create Assignment"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Assignment Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter assignment title"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the assignment"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Deadline (Date and Time)
          </label>

          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            OneDrive Link
          </label>

          <input
            type="url"
            name="oneDriveLink"
            value={formData.oneDriveLink}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Submission Type
          </label>

          <select
            name="submissionType"
            value={formData.submissionType}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          >
            <option value="Individual">Individual</option>
            <option value="Group">Group</option>
          </select>
        </div>

        {formData.submissionType === "Group" && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-slate-900">
                Select Groups
              </h3>

              <p className="mt-1 text-xs text-slate-600">
                Choose which groups must complete this assignment.
              </p>
            </div>

            {groups.length === 0 ? (
              <p className="rounded-lg bg-white p-4 text-sm text-slate-500">
                No groups are available in this course yet.
                Students must create groups before you can assign
                this work.
              </p>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => {
                  const isSelected =
                    formData.assignedGroupIds.includes(group.id);

                  const leader = group.memberIds.find(
                    (memberId) => memberId === group.leaderId
                  );

                  return (
                    <label
                      key={group.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleGroupSelection(group.id)
                        }
                        className="mt-1 h-4 w-4 accent-blue-600"
                      />

                      <span>
                        <span className="block text-sm font-semibold text-slate-800">
                          {group.name}
                        </span>

                        <span className="mt-1 block text-xs text-slate-500">
                          Leader ID: {leader || group.leaderId}
                        </span>

                        <span className="mt-1 block text-xs text-slate-500">
                          {group.memberIds.length} member(s)
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <p className="mt-3 text-xs font-semibold text-blue-700">
              {formData.assignedGroupIds.length} group(s) selected
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            {initialData ? "Update Assignment" : "Create Assignment"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
