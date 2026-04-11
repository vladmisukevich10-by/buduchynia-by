from pydantic import BaseModel, EmailStr
from typing import List, Optional

class SpecialtyBase(BaseModel):
    name: str
    code: str
    budget_score: Optional[float]
    paid_score: Optional[float]
    subjects: List[str]

    class Config:
        from_attributes = True

class FacultyBase(BaseModel):
    id: int
    name: str
    specialties: List[SpecialtyBase]

    class Config:
        from_attributes = True

class UniversityBase(BaseModel):
    id: int
    name: str
    short_name: str
    description: Optional[str]
    history: Optional[str]
    cover_image: Optional[str]
    website: Optional[str]
    address: Optional[str]
    founded_year: Optional[int]
    has_military_faculty: bool
    has_dormitory: bool
    faculties: List[FacultyBase]

    class Config:
        from_attributes = True

# Схемы для чата и регистрации
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    school_class: int
    average_grade: float
    interests: List[str]
    achievements: List[str]

class UserResponse(BaseModel):
    id: int
    full_name: str
    cri_score: float

    class Config:
        from_attributes = True

class Message(BaseModel):
    role: str
    content: str

class NavigatorRequest(BaseModel):
    student_id: int
    question: str
    history: List[Message]

class NavigatorResponse(BaseModel):
    answer: str