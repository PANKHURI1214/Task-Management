# TaskFlow — Task Management System

A web-based Task Management System where Admin/Manager assigns tasks to employees and tracks completion.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python (http.server - no framework) |
| Database | MySQL |

## Data Flow

User Interface (HTML/CSS/JS)
        ↓
Python Middleware (server.py)
        ↓
MySQL Database

## Project Structure

TASK MANAGEMENT/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── dashboard.js
│   │   ├── employees.js
│   │   ├── login.js
│   │   ├── particles.js
│   │   ├── tasks.js
│   │   └── utils.js
│   ├── dashboard.html
│   ├── employees.html
│   ├── login.html
│   └── tasks.html
├── backend/
│   ├── db.py
│   └── server.py
├── database/
│   └── schema.sql
├── .gitignore
└── README.md

## Modules

### 1. Authentication Module
- Login page with username and password
- Role based access (Admin / Employee)
- Passwords stored as SHA-256 hash in MySQL

### 2. Employee Module
- Admin can view all employees
- Admin can add new employees
- Employees linked to login accounts via foreign key

### 3. Task Management Module
- Admin assigns tasks to employees
- Task has title, description, priority, due date
- Completed status tracked as True / False
- Admin can delete tasks
- Employee can mark task as done

### 4. Database Module
- 3 tables: login, employees, tasks
- Foreign key relationships between all tables
- login → employees → tasks

### 5. UI Module
- Dark space themed UI
- Animated particle background
- Neon glow effects
- Task form with dropdowns
- Completed True/False selection
- Toast notifications
- Responsive sidebar

## Database Tables

### login
| Column | Type | Description |
|--------|------|-------------|
| login_id | INT | Primary Key |
| username | VARCHAR | Unique username |
| password | VARCHAR | SHA-256 hashed |
| role | ENUM | admin / employee |

### employees
| Column | Type | Description |
|--------|------|-------------|
| employee_id | INT | Primary Key |
| login_id | INT | Foreign Key → login |
| full_name | VARCHAR | Employee name |
| email | VARCHAR | Employee email |
| department | VARCHAR | Department |
| position | VARCHAR | Job position |

### tasks
| Column | Type | Description |
|--------|------|-------------|
| task_id | INT | Primary Key |
| title | VARCHAR | Task title |
| description | TEXT | Task details |
| employee_id | INT | Foreign Key → employees |
| assigned_by | INT | Foreign Key → login |
| priority | ENUM | Low / Medium / High |
| due_date | DATE | Due date |
| completed | BOOLEAN | True / False |

## Setup Instructions

### Step 1 - Clone the repository
git clone https://github.com/yourusername/task-management-system.git
cd task-management-system

### Step 2 - Setup Database
Open MySQL Workbench and run database/schema.sql

### Step 3 - Configure Database Password
Open backend/db.py and add your MySQL password here:

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",  # add your MySQL password here
    "database": "task_management_system"
}

### Step 4 - Install Python dependency
pip install mysql-connector-python

### Step 5 - Run the server
cd backend
python server.py

### Step 6 - Open browser
http://localhost:8000

## Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Employee | jsmith | employee123 |
| Employee | rgarcia | employee123 |
| Employee | mchen | employee123 |

## Features

- Role based login (Admin / Employee)
- Admin assigns tasks to employees
- Task priority (Low / Medium / High)
- Task completion tracking (True / False)
- Admin can delete tasks
- Employee sees only their own tasks
- Animated dark UI with neon effects
- Passwords hashed with SHA-256
- No framework used - pure Python
- No external libraries for frontend - fully offline

