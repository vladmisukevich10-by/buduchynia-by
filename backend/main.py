from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import ollama
from database import engine, Base, get_db
import models
import schemas

app = FastAPI(title="Будучыня.BY API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.post("/register", response_model=schemas.UserResponse)
async def register_user(user_data: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    query = select(models.User).where(models.User.email == user_data.email)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Этот email уже зарегистрирован")

    new_user = models.User(
        full_name=user_data.full_name,
        email=user_data.email,
        school_class=user_data.school_class,
        average_grade=user_data.average_grade,
        interests=user_data.interests,
        achievements=user_data.achievements
    )
    new_user.calculate_cri()
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.post("/ask_navigator", response_model=schemas.NavigatorResponse)
async def ask_navigator(req: schemas.NavigatorRequest, db: AsyncSession = Depends(get_db)):
    user_query = await db.execute(select(models.User).where(models.User.id == req.student_id))
    user = user_query.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Студент не найден")
    
    # 2. RAG: Эмбеддинги и поиск контекста
    q_emb = ollama.embeddings(model="nomic-embed-text", prompt=req.question)["embedding"]
    kb_query = select(models.KnowledgeBase).order_by(
        models.KnowledgeBase.embedding.cosine_distance(q_emb)
    ).limit(5)
    kb_results = (await db.execute(kb_query)).scalars().all()
    context = "\n".join([f"- {r.content}" for r in kb_results]) if kb_results else "ИНФОРМАЦИЯ В БАЗЕ ОТСУТСТВУЕТ"

    # 3. Формируем системный промпт
    system_prompt = (
        f"Ты — официальный AI-помощник системы 'Будучыня.BY'. Твоя цель — помогать абитуриентам.\n\n"
        f"ПРАВИЛА:\n"
        f"1. ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.\n"
        f"2. ИСПОЛЬЗУЙ ТОЛЬКО КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ НИЖЕ.\n"
        f"3. Если в контексте нет ответа, скажи, что специализируешься только на образовании.\n"
        f"4. Обращайся к пользователю по имени: {user.full_name}.\n\n"
        f"КОНТЕКСТ:\n{context}\n\n"
        f"ДАННЫЕ УЧЕНИКА:\nКласс: {user.school_class}, Ср. балл: {user.average_grade}, Достижения: {user.achievements}"
    )

    # Собираем историю для LLM
    messages_for_llm = [{'role': 'system', 'content': system_prompt}]
    for msg in req.history:
        messages_for_llm.append({'role': msg.role, 'content': msg.content})
    messages_for_llm.append({'role': 'user', 'content': req.question})

    # 4. Запрос к LLM
    response = await ollama.AsyncClient().chat(
        model='qwen2.5:7b', 
        messages=messages_for_llm,
        options={'temperature': 0, 'top_p': 0.1}
    )
    
    return {"answer": response['message']['content']}

@app.get("/health")
async def health():
    return {"status": "online"}