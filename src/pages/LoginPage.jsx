
import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {

  const { login, isAuthenticated, user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const notice = location.state?.registered
    ? "Account created successfully! Please log in."
    : "";

  // Redirect already logged-in users
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

  // Validate login form
  function validateForm() {

    if (!formData.email.trim()) {
      return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.password) {
      return "Password is required.";
    }

    return "";
  }

  // Handle login
  function handleSubmit(event) {

    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {

      setLoading(true);

      const session = login(
        formData.email,
        formData.password
      );

      navigate(`/${session.user.role}/dashboard`, {
        replace: true,
      });

    } catch (error) {

      setError(error.message);

    } finally {

      setLoading(false);

    }
  }

  return (

    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg shadow-blue-200">
            J
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            Joineazy
          </h1>

          <p className="text-slate-500 mt-2">
            Learn, collaborate and achieve together.
          </p>

        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-7 sm:p-9">

          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back!
          </h2>

          <p className="text-sm text-slate-500 mt-2 mb-7">
            Enter your account details to continue.
          </p>

          {/* Registration Success */}
          {notice && (
            <div
              role="status"
              className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-5"
            >
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

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
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />

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
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-20 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

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

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-blue-200"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-500 mt-7">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>

        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-5">

          <p className="text-sm font-semibold text-blue-900">
            Demo account
          </p>

          <p className="text-xs text-blue-800 mt-2">
            Email: admin1@joineazy.demo
          </p>

          <p className="text-xs text-blue-800 mt-1">
            Password: Joineazy@123
          </p>

          <p className="text-xs text-blue-700 mt-2">
            You can also use any seeded student account with the same password.
          </p>

        </div>

      </div>

    </div>

  );
}
