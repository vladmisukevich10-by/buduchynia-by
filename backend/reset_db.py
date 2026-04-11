import asyncio
from database import engine, Base
import models # Импортируем модели, чтобы Base о них знал

async def reset_db():
    async with engine.begin() as conn:
        print("⚠️  Удаление старых таблиц...")
        await conn.run_sync(Base.metadata.drop_all)
        
        print("🏗️  Создание новых таблиц с актуальными полями...")
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ База данных успешно обновлена!")

if __name__ == "__main__":
    asyncio.run(reset_db())