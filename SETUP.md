# DonateBridge Setup & Execution Guide

This document provides step-by-step instructions for running the **DonateBridge** platform on your local laptop or development environment.

---

## 🛠️ System Prerequisites

Ensure you have the following installed on your machine:
1. **Node.js** (v18.0.0 or higher) & **npm** (v9.0.0 or higher)
2. **Python** (v3.12 or higher) & **pip**
3. **Docker** & **Docker Compose** (for running the MySQL 8 database service)

---

## 💾 Database Initialization (MySQL)

DonateBridge uses **MySQL 8** running inside a Docker container.

1. **Start the Database Container**:
   Ensure Docker is running, then start the container:
   ```bash
   docker start db-mysql
   ```
   *If the container does not exist yet, you can run one mapped to port `3307`:*
   ```bash
   docker run --name db-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=donatebridge -p 3307:3306 -d mysql:8
   ```

2. **Verify Database Configuration**:
   The database configuration is read from `donatebridge_backend/.env`:
   ```ini
   USE_SQLITE=False
   DB_NAME=donatebridge
   DB_USER=root
   DB_PASSWORD=root
   DB_HOST=127.0.0.1
   DB_PORT=3307
   ```

---

## 🐍 Backend Setup (Django)

1. **Navigate to the Backend Directory**:
   ```bash
   cd donatebridge_backend
   ```

2. **Create and Activate a Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
   **Key Libraries Installed**:
   - `Django` (v5)
   - `djangorestframework`
   - `djangorestframework-simplejwt` (JWT Auth)
   - `PyMySQL` (MySQL driver)
   - `Pillow` (Image upload processor)
   - `python-dotenv` (Environment configuration reader)

4. **Apply Database Migrations**:
   ```bash
   python3 manage.py migrate
   ```

5. **Seed the Database with Sample Data**:
   This populates the database with test accounts, categories, and active need listings:
   ```bash
   python3 manage.py seed_db
   ```

6. **Start the Django Server**:
   ```bash
   python3 manage.py runserver 0.0.0.0:8000
   ```
   The backend API is now running at `http://localhost:8000/`.

---

## 💻 Frontend Setup (React + Vite)

1. **Open a New Terminal and Navigate to the Repository Root**:
   ```bash
   cd /home/interceptor/Downloads/DonateBridge
   ```

2. **Install Node Modules**:
   ```bash
   npm install
   ```

3. **Start the Vite Development Server**:
   ```bash
   npm run dev
   ```
   The application is now running at `http://localhost:5173/`.

---

## 🔑 Default Test Accounts & Roles

Once seeded, you can log in to the frontend using the following test credentials:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `password` | Accesses verification queues and metrics charts. |
| **Donor** | `donor@test.com` | `password` | Submits listings and views active logistics coordinates. |
| **NGO** | `ngo@test.com` | `password` | Claims donations, updates needs, and schedules events. |

---

## 🧪 Running Verification Test Suites

To verify that the database constraints and endpoint handlers are fully functional:
```bash
cd donatebridge_backend
python3 manage.py test
```
