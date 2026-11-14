# Student Assignment Management System

**Joineazy – A Student and Professor Assignment Management Platform**

A responsive assignment management platform built using React 19, Vite and Tailwind CSS. Joineazy provides separate dashboards for students and professors to manage courses, assignments, groups and submission progress.

## 🚀 Live Demo

**Live Application:**  
https://student-assignment-management-syste.vercel.app/

**GitHub Repository:**  
https://github.com/RangannagariGuruBalaji/Student-Assignment-Management-System

## 📌 Project Overview

Joineazy is a student and professor assignment management platform designed to simplify course management, assignment distribution, group collaboration and submission tracking.

Professors can create and manage courses, publish assignments, assign work to individual students or selected groups, and monitor submission progress.

Students can view enrolled courses, access assignments, create or join groups, acknowledge submissions and track their overall progress.

The application uses role-based authentication and browser localStorage for data persistence.

## ✨ Features

### 👨‍🏫 Professor Features

- Professor registration and login.
- Dedicated professor dashboard.
- Create, view and manage courses.
- Create, edit and delete assignments.
- Assign individual assignments to students.
- Create group assignments and select target groups.
- Add assignment descriptions and deadlines.
- Add OneDrive resource links.
- Track submitted and pending assignments.
- View individual student submission progress.
- Monitor group assignment acknowledgement status.
- View assignment completion percentages.
- Track overdue assignments.

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
- Display group acknowledgement details to all group members.

### 📱 Additional Features

- Responsive dashboard layout.
- Role-based protected routes.
- Search and filter assignments.
- Assignment status indicators.
- Overdue assignment tracking.
- Progress bars and dashboard statistics.
- Toast notifications.
- Browser localStorage data persistence.
- Reusable React components.
- Student and professor dashboards.

## 🛠️ Technologies Used

| Technology           | Purpose                       |
| -------------------- | ----------------------------- |
| React 19             | Frontend development          |
| JavaScript           | Application logic             |
| Tailwind CSS         | Styling and responsive design |
| HTML5                | Page structure                |
| CSS3                 | Styling                       |
| Vite                 | Development and build tool    |
| React Router DOM     | Application routing           |
| Browser localStorage | Data persistence              |
| Git                  | Version control               |
| GitHub               | Source code management        |
| Vercel               | Application deployment        |

## 👤 Demo Login Accounts

The application includes sample accounts for testing.

### Professors

| Name        | Email                | Role      |
| ----------- | -------------------- | --------- |
| Professor A | admin1@joineazy.demo | Professor |
| Professor B | admin2@joineazy.demo | Professor |

### Students

| Name   | Email                  | Role    |
| ------ | ---------------------- | ------- |
| Balaji | student1@joineazy.demo | Student |
| Ravi   | student2@joineazy.demo | Student |
| Suresh | student3@joineazy.demo | Student |
| Priya  | student4@joineazy.demo | Student |
| Anjali | student5@joineazy.demo | Student |

**Demo Password for all accounts:** `Joineazy@123`

Use these sample accounts to explore the student and professor dashboards.

## 📂 Project Structure

```text
Student-Assignment-Management-System/
│
└── frontend/
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
    │   │   ├── CourseAssignmentsPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   │
    │   ├── services/
    │   │   ├── authService.js
    │   │   └── storageService.js
    │   │
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    │
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── eslint.config.js
    ├── vite.config.js
    └── README.md
```

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/RangannagariGuruBalaji/Student-Assignment-Management-System.git
```

### 2. Navigate to the frontend folder

```bash
cd Student-Assignment-Management-System/frontend
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

## 🧪 Testing and Build

To check the code using ESLint:

```bash
npm run lint
```

To create a production build:

```bash
npm run build
```

The production files will be generated inside the `dist` folder.

## 🏗️ Architecture and Design Decisions

### Component-Based Architecture

The application uses reusable React components to organize dashboards, assignment forms, group management, submission tracking and notifications.

### Authentication and Role-Based Access

The application supports student and professor roles. Protected routes ensure that users access the appropriate dashboard based on their role.

### State Management

React `useState` and `useEffect` manage application state and synchronize relevant information with browser localStorage.

### Data Persistence

Browser localStorage stores user, session, course, assignment and group information so that application data can persist across browser refreshes.

### Responsive Design

Tailwind CSS utility classes provide a responsive interface for desktop and mobile devices.

## 💾 Data Storage

The application uses browser localStorage for data persistence instead of a backend database.

Application data is maintained using dedicated storage keys for:

- User accounts.
- Authentication sessions.
- Courses.
- Assignments.
- Groups.

The application also includes sample course, student and assignment data for demonstration purposes.

## 🔮 Future Improvements

- Backend API integration.
- Database integration.
- Secure server-side authentication and authorization.
- Assignment file uploads.
- Email notifications.
- Advanced reporting and analytics.

## 👨‍💻 Developer

**R. Guru Balaji**

B.Tech – Computer Science and Engineering

**GitHub:**  
https://github.com/RangannagariGuruBalaji

## 📌 Project Links

**Live Application:**  
https://student-assignment-management-syste.vercel.app/

**GitHub Repository:**  
https://github.com/RangannagariGuruBalaji/Student-Assignment-Management-System

Student Assignment Management System – Joineazy

Learn, collaborate and achieve together.
