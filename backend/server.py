import json
import hashlib
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from db import run_query

FRONTEND_DIR = r"D:\Task managemnt\frontend"
PORT = 8000

CONTENT_TYPES = {
    ".html": "text/html",
    ".css":  "text/css",
    ".js":   "application/javascript",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".svg":  "image/svg+xml",
}

def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def json_response(handler, status, data):
    body = json.dumps(data, default=str).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(body)

def get_body(handler):
    length = int(handler.headers.get("Content-Length", 0))
    if length == 0:
        return {}
    try:
        return json.loads(handler.rfile.read(length))
    except:
        return {}


class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def serve_static(self, path):
        if path == "/":
            path = "/login.html"
        file_path = os.path.normpath(os.path.join(FRONTEND_DIR, path.lstrip("/")))
        if not file_path.startswith(os.path.normpath(FRONTEND_DIR)):
            self.send_error(403)
            return
        if not os.path.isfile(file_path):
            self.send_error(404)
            return
        ext = os.path.splitext(file_path)[1]
        with open(file_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", CONTENT_TYPES.get(ext, "application/octet-stream"))
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        query  = parse_qs(parsed.query)

        if path == "/api/employees":
            employees = run_query(
                "SELECT employee_id, full_name, email, department, position FROM employees ORDER BY full_name",
                fetch=True)
            return json_response(self, 200, employees)

        if path == "/api/tasks/summary":
            summary = run_query(
                """SELECT COUNT(*) AS total,
                          SUM(completed=TRUE)  AS completed,
                          SUM(completed=FALSE) AS pending
                   FROM tasks""", fetch_one=True)
            return json_response(self, 200, summary)

        if path == "/api/tasks":
            sql = """SELECT t.task_id, t.title, t.description, t.priority,
                            t.due_date, t.completed, t.created_at,
                            e.employee_id, e.full_name AS employee_name, e.department
                     FROM tasks t
                     JOIN employees e ON t.employee_id = e.employee_id
                     WHERE 1=1"""
            params = []
            if "employee_id" in query:
                sql += " AND t.employee_id = %s"
                params.append(query["employee_id"][0])
            if "completed" in query:
                sql += " AND t.completed = %s"
                params.append(query["completed"][0].lower() == "true")
            sql += " ORDER BY t.due_date ASC"
            tasks = run_query(sql, tuple(params), fetch=True)
            return json_response(self, 200, tasks)

        return self.serve_static(path)

    def do_POST(self):
        path = urlparse(self.path).path
        body = get_body(self)

        if path == "/api/login":
            username = body.get("username", "").strip()
            password = body.get("password", "")
            if not username or not password:
                return json_response(self, 400, {"error": "Username and password required"})
            user = run_query(
                "SELECT login_id, username, role FROM login WHERE username=%s AND password=%s",
                (username, hash_password(password)), fetch_one=True)
            if not user:
                return json_response(self, 401, {"error": "Invalid username or password"})
            employee = run_query(
                "SELECT employee_id, full_name FROM employees WHERE login_id=%s",
                (user["login_id"],), fetch_one=True)
            return json_response(self, 200, {
                "message": "Login successful",
                "user": user,
                "employee": employee
            })

        if path == "/api/tasks":
            title       = body.get("title")
            employee_id = body.get("employee_id")
            if not title or not employee_id:
                return json_response(self, 400, {"error": "title and employee_id are required"})
            new_id = run_query(
                """INSERT INTO tasks
                   (title, description, employee_id, assigned_by, priority, due_date, completed)
                   VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (title,
                 body.get("description", ""),
                 employee_id,
                 body.get("assigned_by"),
                 body.get("priority", "Medium"),
                 body.get("due_date"),
                 bool(body.get("completed", False))))
            return json_response(self, 201, {"message": "Task created", "task_id": new_id})

        if path == "/api/employees":
            full_name = body.get("full_name")
            email     = body.get("email")
            username  = body.get("username")
            password  = body.get("password")

            if not full_name or not email or not username or not password:
                return json_response(self, 400, {"error": "All fields are required"})

            existing = run_query(
                "SELECT login_id FROM login WHERE username=%s",
                (username,), fetch_one=True)
            if existing:
                return json_response(self, 400, {"error": "Username already taken"})

            login_id = run_query(
                "INSERT INTO login (username, password, role) VALUES (%s, %s, 'employee')",
                (username, hash_password(password)))

            new_id = run_query(
                """INSERT INTO employees (login_id, full_name, email, department, position)
                   VALUES (%s,%s,%s,%s,%s)""",
                (login_id,
                 full_name,
                 email,
                 body.get("department", ""),
                 body.get("position", "")))

            return json_response(self, 201, {
                "message": "Employee created",
                "employee_id": new_id
            })

        json_response(self, 404, {"error": "Route not found"})

    def do_PUT(self):
        path  = urlparse(self.path).path
        body  = get_body(self)
        parts = path.strip("/").split("/")

        if len(parts) == 3 and parts[0] == "api" and parts[1] == "tasks":
            task_id = parts[2]
            fields, params = [], []
            for field in ["title", "description", "priority", "due_date", "completed", "employee_id"]:
                if field in body:
                    fields.append(f"{field} = %s")
                    params.append(body[field])
            if not fields:
                return json_response(self, 400, {"error": "No fields to update"})
            params.append(task_id)
            run_query(f"UPDATE tasks SET {', '.join(fields)} WHERE task_id = %s", tuple(params))
            return json_response(self, 200, {"message": "Task updated"})

        json_response(self, 404, {"error": "Route not found"})

    def do_DELETE(self):
        path  = urlparse(self.path).path
        parts = path.strip("/").split("/")

        if len(parts) == 3 and parts[0] == "api" and parts[1] == "tasks":
            run_query("DELETE FROM tasks WHERE task_id = %s", (parts[2],))
            return json_response(self, 200, {"message": "Task deleted"})

        json_response(self, 404, {"error": "Route not found"})


def run():
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()

if __name__ == "__main__":
    run()