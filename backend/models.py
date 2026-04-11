from sqlalchemy import Column, Integer, String, Float, JSON, Text, ForeignKey # <-- Добавили ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    school_class = Column(Integer)
    
    average_grade = Column(Float, default=0.0)
    achievements = Column(JSON, default=[])
    interests = Column(JSON, default=[])
    
    cri_score = Column(Float, default=0.0)

    def calculate_cri(self):
        """
        Логика CRI: (Балл * 10) + количество достижений * 5
        """
        base_score = self.average_grade * 10
        achievement_bonus = len(self.achievements) * 5
        self.cri_score = base_score + achievement_bonus
        return self.cri_score

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    category = Column(String)
    # Вектор для nomic-embed-text имеет размерность 768
    embedding = Column(Vector(768))

class University(Base):
    __tablename__ = "universities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    short_name = Column(String)
    description = Column(String)
    logo_url = Column(String)
    website = Column(String)
    
    faculties = relationship("Faculty", back_populates="university", cascade="all, delete")

class Faculty(Base):
    __tablename__ = "faculties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    university_id = Column(Integer, ForeignKey("universities.id"))
    
    university = relationship("University", back_populates="faculties")
    specialties = relationship("Specialty", back_populates="faculty", cascade="all, delete")

class Specialty(Base):
    __tablename__ = "specialties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String)
    faculty_id = Column(Integer, ForeignKey("faculties.id"))
    
    budget_score = Column(Float)
    paid_score = Column(Float)
    subjects = Column(JSON)
    slots_budget = Column(Integer)
    slots_paid = Column(Integer)
    
    faculty = relationship("Faculty", back_populates="specialties")