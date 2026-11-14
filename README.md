# Student Assignment Management System

A responsive assignment management platform built using **React.js, Vite and Tailwind CSS**. The application provides separate dashboards for students and professors to manage courses, assignments, groups and submission progress.

## 🚀 Project Overview

**Joineazy** is a student and professor assignment management platform designed to simplify course management, assignment distribution and submission tracking.

Professors can create and manage courses, publish assignments, assign work to individual students or groups, and monitor submission progress.

Students can view enrolled courses, access assignments, join groups, acknowledge assignment submissions and track their progress.

The application uses role-based authentication and browser localStorage for data persistence.

## ✨ Features

### 👨‍🏫 Professor Features

- Professor registration and login.
- Dedicated professor dashboard.
- Create and manage courses.
- Create, edit and delete assignments.
- Assign individual or group assignments.
- Set assignment descriptions and deadlines.
- Add OneDrive resource links.
- Select groups for group assignments.
- Track submitted and pending assignments.
- View individual student submission progress.
- Monitor group acknowledgement status.
- View assignment completion percentages.

### 🎓 Student Features

- Student registration and login.
- Dedicated student dashboard.
- View enrolled courses.
- View individual and group assignments.
- Access assignment resource links.
- Acknowledge individual assignments.
- View group assignment acknowledgement details.
- Create and join course groups.
- View group leaders and members.
- Track submitted, pending and overdue assignments.
- Monitor assignment completion progress.

### 👥 Group Management

- Create groups within courses.
- Join available groups.
- Assign a group leader.
- View group members.
- Prevent students from joining multiple groups within the same course.
- Assign group assignments to selected groups.
- Allow only the group leader to acknowledge group assignments.
- Display acknowledgement details to all group members.

### 📱 Additional Features

- Responsive dashboard layout.
- Role-based protected routes.
- Search and filter assignments.
- Assignment status indicators.
- Overdue assignment tracking.
- Progress bars and statistics.
- Toast notifications.
- Browser localStorage data persistence.
- Reusable React components.

## 🛠️ Technologies Used

| Technology           | Purpose                       |
| -------------------- | ----------------------------- |
| React 19             | Frontend development          |
| JavaScript           | Application logic             |
| Tailwind CSS         | Styling and responsive design |
| HTML5                | Page structure                |
| Vite                 | Development and build tool    |
| React Router         | Application routing           |
| Browser localStorage | Data persistence              |
| Git & GitHub         | Version control               |

## 👤 Demo Login Accounts

The application includes sample accounts for testing.

### Professors

| Name        | Role      |
| ----------- | --------- |
| Professor A | Professor |
| Professor B | Professor |

### Students

| Name   | Role    |
| ------ | ------- |
| Balaji | Student |
| Ravi   | Student |
| Suresh | Student |
| Priya  | Student |
| Anjali | Student |

**Demo password:** `Joineazy@123`

Use the sample accounts to explore the student and professor dashboards.

## 📂 Project Structure

```text
Student-Assignment-Management-System/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── AssignmentForm.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── GroupManagement.jsx
│   │   ├── MyGroupsSection.jsx
│   │   ├── SubmissionTracking.jsx
│   │   └── Toast.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── data/
│   │   ├── courseData.js
│   │   └── seedData.js
│   │
│   ├── pages/
│   │   ├── StudentDashboard.jsx
│   │   ├── ProfessorDashboard.jsx
│   │   └── CourseAssignmentsPage.jsx
│   │
│   ├── services/
│   │   ├── authService.js
│   │   └── storageService.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/RangannagariGuruBalaji/Student-Assignment-Management-System.git
```

### 2. Navigate to the project folder

```bash
cd Student-Assignment-Management-System
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the application

Visit the local URL displayed in your terminal, usually:

```text
http://localhost:5173/
```

## 🏗️ Architecture and Design Decisions

### Component-Based Architecture

The application uses reusable React components to organize dashboards, assignment forms, group management and submission tracking.

### Authentication and Role-Based Access

The application supports student and professor roles. Protected routes ensure that users access the appropriate dashboard based on their role.

### State Management

React `useState` and `useEffect` manage application state and synchronize relevant data with browser localStorage.

### Data Persistence

Browser localStorage stores user, session, course, assignment and group information so that application data can persist across browser refreshes.

### Responsive Design

Tailwind CSS utility classes provide a responsive interface for desktop and mobile devices.

## 💾 Data Storage

The application uses browser localStorage for data persistence instead of a backend database.

Application data is maintained using dedicated storage keys for users, sessions, courses, assignments and groups.

The application also includes sample course, student and assignment data for demonstration purposes.

## 🔮 Future Improvements

- Backend API integration.
- Database integration.
- Secure server-side authentication.
- Assignment file uploads.
- Email and deadline notifications.
- Advanced reporting and analytics.

## 👨‍💻 Developer

**R. Guru Balaji**

B.Tech – Computer Science and Engineering

GitHub: [RangannagariGuruBalaji](https://github.com/RangannagariGuruBalaji)

## 🔗 Project Links

**GitHub Repository:**

https://github.com/RangannagariGuruBalaji/Student-Assignment-Management-System

**Live Demo:** Deployment pending.
