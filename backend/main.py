from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import ollama  # Импорт для работы с локальным ИИ
from database import engine, Base, get_db
import models
import schemas

app = FastAPI(title="Будучыня.BY API")

@app.on_event("startup")
async def startup():
    # Создаем таблицы при запуске, если их еще нет
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.post("/register", response_model=schemas.UserResponse)
async def register_user(user_data: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # 1. Проверяем уникальность email
    query = select(models.User).where(models.User.email == user_data.email)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Этот email уже зарегистрирован")

    # 2. Создаем модель пользователя
    new_user = models.User(
        full_name=user_data.full_name,
        email=user_data.email,
        school_class=user_data.school_class,
        average_grade=user_data.average_grade,
        interests=user_data.interests,
        achievements=user_data.achievements
    )

    # 3. Рассчитываем индекс CRI
    new_user.calculate_cri()

    # 4. Записываем в БД
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@app.post("/ask_navigator", response_model=schemas.NavigatorResponse)
async def ask_navigator(req: schemas.NavigatorRequest, db: AsyncSession = Depends(get_db)):
    # 1. Получаем данные ученика для контекста ИИ
    query = select(models.User).where(models.User.id == req.student_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Ученик не найден")

    # 2. Формируем "личность" и контекст для модели
    interests_str = ", ".join(user.interests) if user.interests else "не указаны"
    system_prompt = (
        f"Ты — мудрый карьерный консультант проекта 'Будучыня.BY'. "
        f"Помогаешь школьникам Беларуси. Твой собеседник: {user.full_name}, "
        f"{user.school_class} класс. Интересы: {interests_str}. Средний балл: {user.average_grade}. "
        f"Отвечай кратко, вдохновляюще и на русском языке."
    )

    # 3. Асинхронный запрос к локальной Ollama
    try:
        response = await ollama.AsyncClient().chat(
            model='qwen2.5:7b', 
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': req.question}
            ]
        )
        return {"answer": response['message']['content']}
    except Exception as e:
        # Если Ollama не запущена или модель не скачана
        raise HTTPException(status_code=500, detail=f"Ошибка AI-модуля: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "online"}