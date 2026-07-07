CREATE DATABASE IF NOT EXISTS task_management_system;
USE task_management_system;

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS login;

-- TABLE 1: login
CREATE TABLE login (
    login_id    INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 2: employees
CREATE TABLE employees (
    employee_id  INT AUTO_INCREMENT PRIMARY KEY,
    login_id     INT,
    full_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    department   VARCHAR(50),
    position     VARCHAR(50),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_login
        FOREIGN KEY (login_id)
        REFERENCES login(login_id)
        ON DELETE SET NULL
);

-- TABLE 3: tasks
CREATE TABLE tasks (
    task_id      INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(150) NOT NULL,
    description  TEXT,
    employee_id  INT NOT NULL,
    assigned_by  INT,
    priority     ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    due_date     DATE,
    completed    BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_task_assigned_by
        FOREIGN KEY (assigned_by)
        REFERENCES login(login_id)
        ON DELETE SET NULL
);

-- SEED DATA
INSERT INTO login (username, password, role) VALUES
('admin',   SHA2('admin123',    256), 'admin'),
('jsmith',  SHA2('employee123', 256), 'employee'),
('rgarcia', SHA2('employee123', 256), 'employee'),
('mchen',   SHA2('employee123', 256), 'employee');

INSERT INTO employees (login_id, full_name, email, department, position) VALUES
(2, 'John Smith',   'jsmith@company.com',  'Engineering', 'Software Developer'),
(3, 'Rosa Garcia',  'rgarcia@company.com', 'Marketing',   'Content Strategist'),
(4, 'Michael Chen', 'mchen@company.com',   'Engineering', 'QA Engineer');