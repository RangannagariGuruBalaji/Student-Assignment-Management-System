
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import ProfessorDashboard from "./pages/ProfessorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CourseAssignmentsPage from "./pages/CourseAssignmentsPage";

import ProtectedRoute from "./components/ProtectedRoute";

// ==========================================
// HOME REDIRECT
// ==========================================

function HomeRedirect() {

  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={`/${user.role}/dashboard`}
      replace
    />
  );
}

// ==========================================
// MAIN APPLICATION
// ==========================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<HomeRedirect />}
        />

        {/* PUBLIC ROUTES */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* PROFESSOR ROUTES */}

        <Route
          element={
            <ProtectedRoute allowedRole="professor" />
          }
        >

          <Route
            path="/professor/dashboard"
            element={<ProfessorDashboard />}
          />

          <Route
            path="/professor/courses/:courseId/assignments"
            element={<CourseAssignmentsPage />}
          />

        </Route>

        {/* STUDENT ROUTES */}

        <Route
          element={
            <ProtectedRoute allowedRole="student" />
          }
        >

          <Route
            path="/student/dashboard"
            element={<StudentDashboard />}
          />

          <Route
            path="/student/courses/:courseId/assignments"
            element={<CourseAssignmentsPage />}
          />

        </Route>

        {/* UNKNOWN ROUTES */}

        <Route
          path="*"
          element={<HomeRedirect />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
