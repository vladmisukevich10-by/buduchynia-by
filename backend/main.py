from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import engine, Base, get_db
import models
import schemas

app = FastAPI(title="Будучыня.BY API")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.post("/register", response_model=schemas.UserResponse)
async def register_user(user_data: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # 1. Проверяем, не занят ли email
    query = select(models.User).where(models.User.email == user_data.email)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Этот email уже зарегистрирован")

    # 2. Создаем объект пользователя
    new_user = models.User(
        full_name=user_data.full_name,
        email=user_data.email,
        school_class=user_data.school_class,
        average_grade=user_data.average_grade,
        interests=user_data.interests,
        achievements=user_data.achievements
    )

    # 3. Считаем индекс CRI (наша математическая фишка)
    new_user.calculate_cri()

    # 4. Сохраняем в базу
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@app.get("/health")
async def health():
    return {"status": "online"}