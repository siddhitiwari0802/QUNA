from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class QuestionCreate(BaseModel):
    title: str
    description: str
    category: str = "Other"
    tags: list[str] = Field(default_factory=list)
   


class AnswerCreate(BaseModel):
    content: str
    question_id: int

class AnswerUpdate(BaseModel):
    content: str
