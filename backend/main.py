from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <-- Новый импорт для CORS
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import ollama  # Импорт для работы с локальным ИИ
from database import engine, Base, get_db
import models
import schemas

app = FastAPI(title="Будучыня.BY API")

# --- ДОБАВЛЕНО: Настройка CORS ---
# Разрешаем твоему Node.js фронтенду делать запросы к этому API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене тут будет URL твоего сайта, пока разрешаем всё
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем POST, GET, OPTIONS и т.д.
    allow_headers=["*"],  # Разрешаем любые заголовки (включая Content-Type)
)
# ----------------------------------

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
    # 1. Получаем данные конкретного ученика из запроса
    user_query = await db.execute(select(models.User).where(models.User.id == req.student_id))
    user = user_query.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Студент не найден")
    
    # 2. RAG: Ищем похожие факты
    q_emb = ollama.embeddings(model="nomic-embed-text", prompt=req.question)["embedding"]
    
    # Увеличиваем лимит до 5 для лучшего охвата
    kb_query = select(models.KnowledgeBase).order_by(
        models.KnowledgeBase.embedding.cosine_distance(q_emb)
    ).limit(5)
    kb_results = (await db.execute(kb_query)).scalars().all()
    
    # Если база пустая, даем LLM понять это
    context = "\n".join([f"- {r.content}" for r in kb_results]) if kb_results else "ИНФОРМАЦИЯ В БАЗЕ ОТСУТСТВУЕТ"

    # 3. Формируем СТРОГИЙ промпт
    system_prompt = (
        f"Ты — официальный AI-помощник системы 'Будучыня.BY'. Твоя цель — помогать абитуриентам.\n\n"
        f"ПРАВИЛА:\n"
        f"1. ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.\n"
        f"2. ИСПОЛЬЗУЙ ТОЛЬКО КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ НИЖЕ.\n"
        f"3. Если в контексте нет ответа на вопрос (например, про кулинарию или ремонт), "
        f"ответь: 'Извините, я специализируюсь только на образовании и не могу ответить на этот вопрос'.\n"
        f"4. Обращайся к пользователю по имени: {user.full_name}.\n\n"
        f"КОНТЕКСТ:\n{context}\n\n"
        f"ДАННЫЕ УЧЕНИКА:\nКласс: {user.school_class}, Ср. балл: {user.average_grade}, Достижения: {user.achievements}"
    )

    # 4. Запрос к LLM с нулевой температурой
    response = await ollama.AsyncClient().chat(
        model='qwen2.5:7b', 
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': req.question}
        ],
        options={
            'temperature': 0,  # Убираем случайность и галлюцинации
            'top_p': 0.1
        }
    )
    
    return {"answer": response['message']['content']}

@app.get("/health")
async def health():
    return {"status": "online"}