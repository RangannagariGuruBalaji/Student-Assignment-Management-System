
import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {

  const { register, isAuthenticated, user } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Redirect logged-in users
  if (isAuthenticated) {
    return (
      <Navigate
        to={`/${user.role}/dashboard`}
        replace
      />
    );
  }

  // Update form values
  function handleChange(event) {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  // Select user role
  function handleRoleChange(role) {

    setFormData((previous) => ({
      ...previous,
      role,
    }));

  }

  // Validate form
  function validateForm() {

    if (!formData.name.trim()) {
      return "Full name is required.";
    }

    if (formData.name.trim().length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (!formData.email.trim()) {
      return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (formData.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!["student", "professor"].includes(formData.role)) {
      return "Please select a valid role.";
    }

    return "";
  }

  // Handle registration
  function handleSubmit(event) {

    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {

      register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Redirect to login with success information
      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          registeredEmail: formData.email.trim(),
        },
      });

    } catch (error) {

      setError(error.message);

    }
  }

  return (

    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-lg">

        {/* Brand */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg shadow-blue-200">
            J
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            Join Joineazy
          </h1>

          <p className="text-slate-500 mt-2">
            Create your account and get started.
          </p>

        </div>

        {/* Registration Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-7 sm:p-9">

          <h2 className="text-2xl font-bold text-slate-900">
            Create account
          </h2>

          <p className="text-sm text-slate-500 mt-2 mb-7">
            Fill in your details below.
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="mb-5">

              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

            </div>

            {/* Email */}
            <div className="mb-5">

              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

            </div>

            {/* Role Selection */}
            <div className="mb-5">

              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select your role
              </label>

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  aria-pressed={formData.role === "student"}
                  onClick={() => handleRoleChange("student")}
                  className={`border rounded-xl p-4 text-left transition ${
                    formData.role === "student"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >

                  <span className="text-2xl">🎓</span>

                  <span className="block font-semibold text-slate-800 mt-2">
                    Student
                  </span>

                  <span className="text-xs text-slate-500">
                    View assignments
                  </span>

                </button>

                <button
                  type="button"
                  aria-pressed={formData.role === "professor"}
                  onClick={() => handleRoleChange("professor")}
                  className={`border rounded-xl p-4 text-left transition ${
                    formData.role === "professor"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >

                  <span className="text-2xl">👨‍🏫</span>

                  <span className="block font-semibold text-slate-800 mt-2">
                    Professor
                  </span>

                  <span className="text-xs text-slate-500">
                    Manage courses
                  </span>

                </button>

              </div>

            </div>

            {/* Password */}
            <div className="mb-5">

              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 pr-20 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              <p className="text-xs text-slate-400 mt-2">
                Use at least 8 characters.
              </p>

            </div>

            {/* Confirm Password */}
            <div className="mb-6">

              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-5"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-blue-200"
            >
              Create account
            </button>

          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-500 mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>

      </div>

    </div>

  );
}
