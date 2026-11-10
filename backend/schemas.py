from pydantic import BaseModel


class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class QuestionCreate(BaseModel):
    title:str
    description:str
    user_id:int


class AnswerCreate(BaseModel):
    content: str
    question_id: int
    user_id: int
