# DonateBridge

DonateBridge is a full-stack platform designed to facilitate transparent, accountable, and geographically-optimized donations between individual donors and vetted Non-Governmental Organizations (NGOs).

The project is structured into a monorepo containing a Django REST framework backend (`server`) and a React + Vite frontend (`client`).

---

## 🛠️ System Prerequisites

Ensure you have the following installed on your machine:
1. **Node.js** (v18.0.0 or higher) & **npm** (v9.0.0 or higher)
2. **Python** (v3.12 or higher) & **pip**
3. **Docker** & **Docker Compose** (for running the MySQL 8 database service, if applicable)

---

## 🚀 Getting Started

### 1. Start the Database Container (Optional if using default SQLite)
DonateBridge uses MySQL 8 in production, but defaults to a local SQLite database for quick development. If you need MySQL, start the container:
```bash
docker start db-mysql
# Or if it doesn't exist:
# docker run --name db-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=donatebridge -p 3307:3306 -d mysql:8
```

### 2. Backend Setup (Django)

Open a terminal in the root of the project and navigate to the backend directory:
```bash
cd server
```

Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
# On Windows: .venv\Scripts\activate
```

Install the required dependencies:
```bash
pip install -r requirements.txt
```

Apply database migrations and seed the database with mock data:
```bash
python manage.py migrate
python manage.py seed_db
```

Start the Django backend API server:
```bash
python manage.py runserver 0.0.0.0:8000
```
*The backend API will be available at `http://localhost:8000`*

### 3. Frontend Setup (React + Vite)

Open a second terminal window in the root of the project and navigate to the client directory:
```bash
cd client
```

Install Node modules and dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend application will be available at `http://localhost:5173`*

---

## 🔑 Default Test Accounts & Roles

Once the database is seeded (`python manage.py seed_db`), you can log in to the frontend using the following test credentials:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `password` | Accesses verification queues, fraud logs, and analytics metrics. |
| **Donor** | `donor@test.com` | `password` | Submits item listings, tracks logistics, and chats with NGOs. |
| **NGO** | `ngo@test.com` | `password` | Claims matched donations, broadcasts needs, and schedules pickup events. |

---

## 📁 Repository Structure

- **`client/`**: The frontend React application. Powered by Vite, styled with Tailwind CSS, and using Leaflet for interactive logistics maps.
- **`server/`**: The backend Django API. Handles JWT authentication, automated donation-to-need smart matching algorithms, logistics tracking, and an extensive admin moderation panel.
