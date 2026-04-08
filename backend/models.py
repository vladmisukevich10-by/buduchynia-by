from sqlalchemy import Column, Integer, String, Float, JSON
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    school_class = Column(Integer)  # Класс (1-11)
    
    # Данные для расчета CRI
    average_grade = Column(Float, default=0.0)  # Средний балл (10-балльная система)
    achievements = Column(JSON, default=list)   # Список достижений (олимпиады и т.д.)
    interests = Column(JSON, default=list)      # Сферы интересов (IT, Медицина, и т.д.)
    
    # Итоговый индекс карьерной готовности
    cri_score = Column(Float, default=0.0)

    def calculate_cri(self):
        """
        Базовая логика CRI для MVP.
        Позже мы вынесем это в отдельный сервис.
        """
        # Упрощенная формула: (Балл * 10) + количество достижений * 5
        base_score = self.average_grade * 10
        achievement_bonus = len(self.achievements) * 5
        self.cri_score = base_score + achievement_bonus
        return self.cri_score