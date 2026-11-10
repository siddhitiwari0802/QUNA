from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from schemas import UserRegister, UserLogin , QuestionCreate , AnswerCreate

app = FastAPI()#application=app

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Welcome to QUNA Backend!"}


@app.post("/register")
def register_user(user: UserRegister):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Check if email already exists
        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (user.email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Insert new user
        cursor.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (user.name, user.email, user.password)
        )

        connection.commit()

        return {
            "message": "User registered successfully!"
        }

    finally:
        cursor.close()
        connection.close()


#Login API
@app.post("/login")
def login_user(user: UserLogin):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT * FROM users
            WHERE email = %s AND password = %s
            """,
            (user.email, user.password)
        )

        existing_user = cursor.fetchone()

        if not existing_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        return {
            "message": "Login successful!",
            "user": {
                "id": existing_user["id"],
                "name": existing_user["name"],
                "email": existing_user["email"]
            }
        }

    finally:
        cursor.close()
        connection.close()



# Create Question API
@app.post("/questions")
def create_question(question: QuestionCreate):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO questions (title, description, user_id)
            VALUES (%s, %s, %s)
            """,
            (
                question.title,
                question.description,
                question.user_id
            )
        )

        connection.commit()

        question_id = cursor.lastrowid

        return {
            "message": "Question created successfully!",
            "question_id": question_id
        }

    finally:
        cursor.close()
        connection.close()



# Get All Questions API
@app.get("/questions")
def get_all_questions():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                questions.id,
                questions.title,
                questions.description,
                questions.user_id,
                users.name AS username,
                questions.created_at
            FROM questions
            JOIN users ON questions.user_id = users.id
            ORDER BY questions.created_at DESC
        """)

        questions = cursor.fetchall()

        return {
            "questions": questions
        }

    finally:
        cursor.close()
        connection.close()



# Get Single Question API
@app.get("/questions/{question_id}")
def get_single_question(question_id: int):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                questions.id,
                questions.title,
                questions.description,
                questions.user_id,
                users.name AS username,
                questions.created_at
            FROM questions
            JOIN users ON questions.user_id = users.id
            WHERE questions.id = %s
            """,
            (question_id,)
        )

        question = cursor.fetchone()

        if not question:
            raise HTTPException(
                status_code=404,
                detail="Question not found"
            )

        return question

    finally:
        cursor.close()
        connection.close()



# Create Answer API
@app.post("/answers")
def create_answer(answer: AnswerCreate):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO answers (content, question_id, user_id)
            VALUES (%s, %s, %s)
            """,
            (
                answer.content,
                answer.question_id,
                answer.user_id
            )
        )

        connection.commit()

        answer_id = cursor.lastrowid

        return {
            "message": "Answer posted successfully!",
            "answer_id": answer_id
        }

    finally:
        cursor.close()
        connection.close()



# Get Answers for a Particular Question
@app.get("/questions/{question_id}/answers")
def get_answers(question_id: int):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                answers.id,
                answers.content,
                answers.question_id,
                answers.user_id,
                users.name AS username,
                answers.created_at
            FROM answers
            JOIN users ON answers.user_id = users.id
            WHERE answers.question_id = %s
            ORDER BY answers.created_at DESC
            """,
            (question_id,)
        )

        answers = cursor.fetchall()

        return {
            "answers": answers
        }

    finally:
        cursor.close()
        connection.close()


