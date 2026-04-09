from sqlalchemy import Column, Integer, String, Float, JSON, Text # <--- Добавили Text
from database import Base
from pgvector.sqlalchemy import Vector

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    school_class = Column(Integer)  # Класс (1-11)
    
    # Данные для расчета CRI
    average_grade = Column(Float, default=0.0)  # Средний балл (10-балльная система)
    achievements = Column(JSON, default=[])      # Список достижений
    interests = Column(JSON, default=[])         # Сферы интересов
    
    # Итоговый индекс карьерной готовности
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
    content = Column(Text, nullable=False)  # Теперь ошибка NameError исчезнет
    category = Column(String)
    # Вектор для nomic-embed-text имеет размерность 768
    embedding = Column(Vector(768))