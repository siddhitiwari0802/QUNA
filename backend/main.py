from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from schemas import UserRegister, UserLogin , QuestionCreate , AnswerCreate, AnswerUpdate
from security import hash_password, verify_password
from auth import create_access_token, get_current_user

app = FastAPI()#application=app

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://localhost:5174"],
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
        
        hashed_password = hash_password(user.password)
        # Insert new user
        cursor.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (user.name, user.email, hashed_password)
        )

        connection.commit()

        return {
            "message": "User registered successfully!"
        }

    finally:
        cursor.close()
        connection.close()



# Login API
@app.post("/login")
def login_user(user: UserLogin):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT * FROM users
            WHERE email = %s
            """,
            (user.email,)
        )

        existing_user = cursor.fetchone()

        if not existing_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        password_is_valid = verify_password(
            user.password,
            existing_user["password"]
        )

        if not password_is_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = create_access_token(
            data={"sub": str(existing_user["id"])}
)

        return {
            "message": "Login successful!",
            "access_token": access_token,
            "token_type": "bearer",
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
def create_question(
    question: QuestionCreate,
    current_user_id: int = Depends(get_current_user)
):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Insert the question
        cursor.execute(
            """
            INSERT INTO questions
            (title, description, user_id, category)
            VALUES (%s, %s, %s, %s)
            """,
            (
                question.title,
                question.description,
                current_user_id,
                question.category.strip() or "Other"
            )
        )

        question_id = cursor.lastrowid

        # Insert custom tags and connect them to the question
        for tag in question.tags:
            tag_name = tag.strip()

            if not tag_name:
                continue

            # Insert tag only if it doesn't already exist
            cursor.execute(
                """
                INSERT IGNORE INTO tags (name)
                VALUES (%s)
                """,
                (tag_name,)
            )

            # Get the tag ID
            cursor.execute(
                "SELECT id FROM tags WHERE name = %s",
                (tag_name,)
            )

            tag_id = cursor.fetchone()[0]

            # Connect tag with question
            cursor.execute(
                """
                INSERT IGNORE INTO question_tags
                (question_id, tag_id)
                VALUES (%s, %s)
                """,
                (question_id, tag_id)
            )

        connection.commit()

        return {
            "message": "Question created successfully!",
            "question_id": question_id
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# Edit Question API
@app.put("/questions/{question_id}")
def update_question(
    question_id: int,
    question: QuestionCreate,
    current_user_id: int = Depends(get_current_user)
):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Check whether the question exists
        cursor.execute(
            "SELECT * FROM questions WHERE id = %s",
            (question_id,)
        )

        existing_question = cursor.fetchone()

        if not existing_question:
            raise HTTPException(
                status_code=404,
                detail="Question not found"
            )

        # Check question ownership
        if existing_question["user_id"] != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot edit someone else's question"
            )

        # Update question details
        cursor.execute(
            """
            UPDATE questions
            SET title = %s,
                description = %s,
                category = %s
            WHERE id = %s
            """,
            (
                question.title,
                question.description,
                question.category.strip() or "Other",
                question_id
            )
        )

        # Remove previous tag connections
        cursor.execute(
            "DELETE FROM question_tags WHERE question_id = %s",
            (question_id,)
        )

        # Add updated tags
        for tag in question.tags:
            tag_name = tag.strip()

            if not tag_name:
                continue

            cursor.execute(
                """
                INSERT IGNORE INTO tags (name)
                VALUES (%s)
                """,
                (tag_name,)
            )

            cursor.execute(
                "SELECT id FROM tags WHERE name = %s",
                (tag_name,)
            )

            tag_id = cursor.fetchone()["id"]

            cursor.execute(
                """
                INSERT IGNORE INTO question_tags
                (question_id, tag_id)
                VALUES (%s, %s)
                """,
                (question_id, tag_id)
            )

        connection.commit()

        return {
            "message": "Question updated successfully!"
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()
   


# Delete Question API
@app.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    current_user_id: int = Depends(get_current_user)
):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT * FROM questions WHERE id = %s",
            (question_id,)
        )

        existing_question = cursor.fetchone()

        if not existing_question:
            raise HTTPException(
                status_code=404,
                detail="Question not found"
            )

        if existing_question["user_id"] != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot delete someone else's question"
            )

        cursor.execute(
            "DELETE FROM questions WHERE id = %s",
            (question_id,)
        )

        connection.commit()

        return {
            "message": "Question deleted successfully!"
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
                questions.category,
                users.name AS username,
                questions.created_at
            FROM questions
            JOIN users ON questions.user_id = users.id
            ORDER BY questions.created_at DESC
        """)

        questions = cursor.fetchall()

        # Get tags for all fetched questions
        if questions:
            question_ids = [q["id"] for q in questions]

            placeholders = ", ".join(["%s"] * len(question_ids))

            cursor.execute(
                f"""
                SELECT
                    question_tags.question_id,
                    tags.name
                FROM question_tags
                JOIN tags ON question_tags.tag_id = tags.id
                WHERE question_tags.question_id IN ({placeholders})
                """,
                tuple(question_ids)
            )

            tag_results = cursor.fetchall()

            # Organize tags by question ID
            tags_by_question = {}

            for tag in tag_results:
                question_id = tag["question_id"]

                if question_id not in tags_by_question:
                    tags_by_question[question_id] = []

                tags_by_question[question_id].append(tag["name"])

            # Attach tags to each question
            for question in questions:
                question["tags"] = tags_by_question.get(
                    question["id"], []
                )
        else:
            questions = []

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
                questions.category,
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

        # Fetch tags belonging to this question
        cursor.execute(
            """
            SELECT tags.name
            FROM question_tags
            JOIN tags ON question_tags.tag_id = tags.id
            WHERE question_tags.question_id = %s
            """,
            (question_id,)
        )

        tag_results = cursor.fetchall()

        question["tags"] = [tag["name"] for tag in tag_results]

        return question

    finally:
        cursor.close()
        connection.close()


# Create Answer API
@app.post("/answers")
def create_answer(
    answer: AnswerCreate,
    current_user_id: int = Depends(get_current_user)
):

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
                current_user_id
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


@app.put("/answers/{answer_id}")
def update_answer(
    answer_id: int,
    answer: AnswerUpdate,
    current_user_id: int = Depends(get_current_user)
):
    if not answer.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Answer cannot be empty."
        )

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT * FROM answers WHERE id = %s",
            (answer_id,)
        )
        existing_answer = cursor.fetchone()

        if existing_answer is None:
            raise HTTPException(
                status_code=404,
                detail="Answer not found."
            )

        if existing_answer["user_id"] != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="You can only edit your own answers."
            )

        cursor.execute(
            "UPDATE answers SET content = %s WHERE id = %s",
            (answer.content.strip(), answer_id)
        )

        connection.commit()

        return {"message": "Answer updated successfully!"}

    finally:
        cursor.close()
        connection.close()


@app.delete("/answers/{answer_id}")
def delete_answer(
    answer_id: int,
    current_user_id: int = Depends(get_current_user)
):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT * FROM answers WHERE id = %s",
            (answer_id,)
        )
        existing_answer = cursor.fetchone()

        if existing_answer is None:
            raise HTTPException(
                status_code=404,
                detail="Answer not found."
            )

        if existing_answer["user_id"] != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own answers."
            )

        cursor.execute(
            "DELETE FROM answers WHERE id = %s",
            (answer_id,)
        )

        connection.commit()

        return {"message": "Answer deleted successfully!"}

    finally:
        cursor.close()
        connection.close()
