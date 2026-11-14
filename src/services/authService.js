
import { users as seedUsers } from "../data/seedData";

const USERS_KEY = "joineazy_users";
const SESSION_KEY = "joineazy_session";

function normalizeRole(role) {
  return role === "admin" ? "professor" : role;
}

function normalizeUser(user) {
  return {
    ...user,
    role: normalizeRole(user.role),
  };
}

export function getUsers() {
  try {
    const savedUsers = localStorage.getItem(USERS_KEY);

    if (savedUsers) {
      const users = JSON.parse(savedUsers).map(normalizeUser);

      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      return users;
    }

    const initialUsers = seedUsers.map((user) => ({
      ...normalizeUser(user),
      email: user.email || `${user.id}@joineazy.demo`,
      password: "Joineazy@123",
    }));

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(initialUsers)
    );

    return initialUsers;
  } catch {
    throw new Error("Unable to load user data.");
  }
}

export function registerUser(formData) {
  const users = getUsers();

  const email = formData.email.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.email.toLowerCase() === email
  );

  if (existingUser) {
    throw new Error(
      "An account with this email already exists."
    );
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: formData.name.trim(),
    email,
    password: formData.password,
    role: normalizeRole(formData.role),
  };

  const updatedUsers = [...users, newUser];

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(updatedUsers)
  );

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
}

export function loginUser(email, password) {
  const users = getUsers();

  const user = users.find(
    (item) =>
      item.email.toLowerCase() === email.trim().toLowerCase() &&
      item.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
  };

  const token = `joineazy-demo-${user.id}-${Date.now()}`;

  const session = {
    token,
    user: safeUser,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}

export function getSession() {
  try {
    const savedSession = localStorage.getItem(SESSION_KEY);

    if (!savedSession) {
      return null;
    }

    const session = JSON.parse(savedSession);

    if (
      !session.token ||
      !session.user ||
      !session.expiresAt ||
      session.expiresAt <= Date.now()
    ) {
      logoutUser();
      return null;
    }

    const updatedSession = {
      ...session,
      user: normalizeUser(session.user),
    };

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(updatedSession)
    );

    return updatedSession;
  } catch {
    logoutUser();
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}
