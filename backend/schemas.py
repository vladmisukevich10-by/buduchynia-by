from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# Схема для отдельного сообщения в истории
class MessageDict(BaseModel):
    role: str      # 'user' или 'assistant'
    content: str

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    school_class: int = Field(..., ge=1, le=11)
    average_grade: float = Field(..., ge=0, le=10)
    interests: List[str] = []
    achievements: List[str] = []

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    cri_score: float

    class Config:
        from_attributes = True

class NavigatorRequest(BaseModel):
    student_id: int
    question: str
    history: List[MessageDict] = []  # Поле для передачи истории переписки

class NavigatorResponse(BaseModel):
    answer: str