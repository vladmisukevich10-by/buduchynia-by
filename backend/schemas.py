from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# То, что мы ждем от фронтенда при регистрации
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    school_class: int = Field(..., ge=1, le=11)
    average_grade: float = Field(..., ge=0, le=10)
    interests: List[str] = []
    achievements: List[str] = []

# То, что мы отдаем фронтенду (с ID и рассчитанным CRI)
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

class NavigatorResponse(BaseModel):
    answer: str