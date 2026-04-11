from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import ollama
from database import engine, Base, get_db
import models
import schemas
from typing import List

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

# --- РАЗДЕЛ ВИКИ ---

@app.get("/universities", response_model=List[schemas.UniversityBase])
async def get_universities(db: AsyncSession = Depends(get_db)):
    # Загружаем всё дерево: Универ -> Факультеты -> Специальности
    result = await db.execute(
        select(models.University).options(
            selectinload(models.University.faculties).selectinload(models.Faculty.specialties)
        )
    )
    return result.scalars().all()

@app.get("/universities/{uni_id}", response_model=schemas.UniversityBase)
async def get_university_detail(uni_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.University)
        .where(models.University.id == uni_id)
        .options(
            selectinload(models.University.faculties).selectinload(models.Faculty.specialties)
        )
    )
    uni = result.scalar_one_or_none()
    if not uni:
        raise HTTPException(status_code=404, detail="Вуз не найден")
    return uni

# --- РАЗДЕЛ НАВИГАТОРА (Твой код) ---

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
    
    q_emb = ollama.embeddings(model="nomic-embed-text", prompt=req.question)["embedding"]
    kb_query = select(models.KnowledgeBase).order_by(
        models.KnowledgeBase.embedding.cosine_distance(q_emb)
    ).limit(5)
    kb_results = (await db.execute(kb_query)).scalars().all()
    context = "\n".join([f"- {r.content}" for r in kb_results]) if kb_results else "ИНФОРМАЦИЯ В БАЗЕ ОТСУТСТВУЕТ"

    system_prompt = (
        f"Ты — официальный AI-помощник системы 'Будучыня.BY'. Твоя цель — помогать абитуриентам.\n\n"
        f"ПРАВИЛА:\n1. ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.\n2. ИСПОЛЬЗУЙ ТОЛЬКО КОНТЕКСТ.\n"
        f"КОНТЕКСТ:\n{context}\n\nДАННЫЕ УЧЕНИКА: {user.full_name}, ср. балл {user.average_grade}"
    )

    messages_for_llm = [{'role': 'system', 'content': system_prompt}]
    for msg in req.history:
        messages_for_llm.append({'role': msg.role, 'content': msg.content})
    messages_for_llm.append({'role': 'user', 'content': req.question})

    response = await ollama.AsyncClient().chat(model='qwen2.5:7b', messages=messages_for_llm)
    return {"answer": response['message']['content']}

@app.get("/health")
async def health():
    return {"status": "online"}