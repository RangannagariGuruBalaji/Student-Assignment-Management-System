
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import MyGroupsSection from "./MyGroupsSection";

export default function DashboardLayout({ children, role }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isProfessor = role === "professor";
  const isStudentDashboard =
    role === "student" &&
    location.pathname === "/student/dashboard";

  const navigation = [
    {
      label: "Dashboard",
      icon: "⌂",
      href: `/${role}/dashboard`,
    },
    {
      label: "Courses",
      icon: "▤",
      href: `/${role}/dashboard#courses`,
    },
    {
      label: "Assignments",
      icon: "▣",
      href: `/${role}/dashboard#assignments`,
    },
    ...(isProfessor
      ? [
          {
            label: "Student Progress",
            icon: "◫",
            href: `/${role}/dashboard#progress`,
          },
        ]
      : [
          {
            label: "My Groups",
            icon: "♧",
            href: `/${role}/dashboard#groups`,
          },
        ]),
  ];

  const currentPage = location.pathname + location.hash;

  function isActive(item) {
    if (item.label === "Dashboard") {
      return (
        location.pathname === item.href &&
        !location.hash
      );
    }

    return currentPage === item.href;
  }

  function renderNavigation() {
    return navigation.map((item) => {
      const active = isActive(item);

      return (
        <a
          key={item.label}
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
            active
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </a>
      );
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            J
          </div>

          <span className="text-xl font-bold text-slate-900">
            Joineazy
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user.name}
            </p>

            <p className="text-xs capitalize text-slate-500">
              {role}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:px-4"
          >
            Logout
          </button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r border-slate-200 bg-white lg:block">
        <div className="p-5">
          <p className="mb-5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-2">
            {renderNavigation()}
          </nav>

          <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Joineazy Workspace
            </p>

            <p className="mt-2 text-xs text-blue-700">
              Learn, collaborate and achieve together.
            </p>
          </div>
        </div>
      </aside>

      <div className="fixed left-0 right-0 top-16 z-20 flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
        {navigation.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${
              isActive(item)
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      <main className="min-h-screen pt-36 lg:pl-64 lg:pt-16">
        <div className="mx-auto max-w-7xl space-y-10 p-5 sm:p-8">
          {children}

          {isStudentDashboard && <MyGroupsSection />}
        </div>
      </main>
    </div>
  );
}
