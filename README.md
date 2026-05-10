# Electronic Medical Record (EMR) Management System

## 🛠 Technologies Used
- **Frontend:** React, Tailwind CSS, Lucide Icons, Sonner.
- **Backend:** Node.js, Express.
- **Database:** MySQL.

## 🚦 Getting Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites
- **Node.js** installed.
- **MySQL Server** installed and running.
- **MySQL Workbench** is recommended for database management and creating a **Local Instance**.

### 1. Backend Configuration
Navigate to the `backend` directory, create a file named `.env`, and fill in your local MySQL Instance information using the following template:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=BTL2
DB_PORT=3306
```
### 2. Launch the Backend
Open a terminal and run the following commands:

```bash
cd backend

# Run this only once when you first launch the project
npm install

# Initialize the database (create tables, functions, procedures, triggers, and sample data)
npm run db:init

# Run the server in development mode
npm run dev
```

### 2. Launch the Frontend
Open a new terminal and run:

```bash
cd frontend

# Run this only once when you first launch the project
npm install

# Run the React application
npm run dev
```

Once completed, you can access the user interface at http://localhost:5173 (Vite's default address).