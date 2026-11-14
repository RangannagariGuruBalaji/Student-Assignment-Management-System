
import { Link } from "react-router-dom";

const colorStyles = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  amber: "bg-amber-100 text-amber-700",
  cyan: "bg-cyan-100 text-cyan-700",
};

export default function CourseCard({
  course,
  role,
  progress = 0,
  isEnrolled = true,
  onEnroll,
}) {

  const colorClass =
    colorStyles[course.color] || colorStyles.blue;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-200">

      <div className="p-5">

        <div className="flex justify-between items-center gap-2">

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${colorClass}`}>
            {course.code}
          </span>

          <span className="text-xs text-slate-400">
            {course.semester || "Fall 2026"}
          </span>

        </div>

        <h3 className="text-lg font-bold text-slate-900 mt-5">
          {course.title}
        </h3>

        <p className="text-sm text-slate-500 mt-2 min-h-10">
          {course.description}
        </p>

        <p className="text-xs text-blue-600 font-semibold mt-4">
          {course.category}
        </p>

        <div className="border-t border-slate-100 mt-5 pt-4 flex justify-between">

          <div>
            <p className="text-xs text-slate-400">
              {role === "professor" ? "Students" : "Assignments"}
            </p>

            <p className="font-bold text-slate-800 mt-1">
              {role === "professor"
                ? course.enrolledStudentIds.length
                : course.assignmentIds.length}
            </p>
          </div>

          {role === "student" && isEnrolled && (
            <div>
              <p className="text-xs text-slate-400">
                My progress
              </p>

              <p className="font-bold text-slate-800 mt-1">
                {progress}%
              </p>
            </div>
          )}

        </div>

        {role === "student" && isEnrolled && (
          <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {isEnrolled ? (
          <Link
            to={`/${role}/courses/${course.id}/assignments`}
            className="block text-center mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition"
          >
            View Course →
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onEnroll(course.id)}
            className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-3 rounded-xl transition"
          >
            Enroll in Course
          </button>
        )}

      </div>

    </div>
  );
}
