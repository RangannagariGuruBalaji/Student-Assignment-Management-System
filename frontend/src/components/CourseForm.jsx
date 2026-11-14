
import { useState } from "react";

export default function CourseForm({ onSave, onCancel }) {

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    category: "Frontend Development",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.code.trim() ||
      !formData.title.trim() ||
      !formData.description.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    onSave(formData);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

      <h2 className="text-xl font-bold text-slate-900 mb-5">
        Create New Course
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-semibold mb-2">
            Course Code
          </label>

          <input
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Example: CS105"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Course Title
          </label>

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter course title"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe this course"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
          >
            <option>Frontend Development</option>
            <option>Backend Development</option>
            <option>Programming</option>
            <option>Database Management</option>
            <option>Other</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex flex-wrap gap-3">

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
          >
            Create Course
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}
