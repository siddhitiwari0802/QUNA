# QUNA – Question & Answer Platform

QUNA is a full-stack Question and Answer platform that allows users to ask questions, share knowledge, and help others by posting answers. It provides user authentication, question management, search and filtering, user profiles, and a clean, responsive interface.

## Features

- **User Authentication:** Registration and login with secure password hashing and JWT authentication.
- **Question Management:** Create, view, edit, and delete questions.
- **Answer Management:** Post, edit, view, and delete answers.
- **User Profiles:** View personal questions, answers, and profile information.
- **Search:** Search questions by title and description.
- **Category and Tag Filtering:** Organize and filter questions by categories and tags.
- **Sorting:** Sort questions by newest and oldest.
- **Pagination:** Display questions across multiple pages.
- **Notifications:** Receive notifications when someone answers your question.
- **Dark Mode:** Switch between light and dark themes.
- **Responsive UI:** Lavender-themed interface designed for different screen sizes.

## Technology Stack

**Frontend**
- React.js
- CSS
- Vite
- JavaScript

**Backend**
- Python
- FastAPI
- REST APIs
- JWT Authentication
- Argon2 Password Hashing

**Database**
- MySQL
- mysql-connector-python

## Project Structure

```text
QUNA/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── schemas.py
│   ├── create_tables.py
│   ├── security.py
│   ├── auth.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/siddhitiwari0802/QUNA.git
cd QUNA
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows:**
```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure MySQL

Create the database:

```sql
CREATE DATABASE quna_db;
```

Create a `.env` file inside the `backend` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=quna_db
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
```

Replace the example values with your own configuration. Never upload your `.env` file to GitHub.

Create the database tables:

```bash
python create_tables.py
```

### 4. Start the Backend

```bash
uvicorn main:app --reload
```

Backend URL: http://127.0.0.1:8000

API Documentation: http://127.0.0.1:8000/docs

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## How It Works

1. Users register and log in to their accounts.
2. Authenticated users can post questions with categories and tags.
3. Other users can view questions and submit answers.
4. Users can manage their own questions and answers.
5. Users can search, filter, and sort questions.
6. Notifications inform question owners when someone answers their questions.

## Future Enhancements

- Deployment to cloud hosting.
- Additional community and engagement features.

## Author

**M Siddhi Tiwari**

GitHub: [siddhitiwari0802](https://github.com/siddhitiwari0802)