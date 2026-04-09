import asyncio
import ollama
from sqlalchemy.ext.asyncio import AsyncSession
# Импортируем именно AsyncSessionLocal (как подсказала ошибка)
from database import AsyncSessionLocal, engine 
import models

KNOWLEDGE_DATA = [
    {"category": "ВУЗ", "content": "БГУ, Факультет прикладной математики и информатики (ФПМИ). Проходной балл в 2025 году был 395 на бюджет."},
    {"category": "ВУЗ", "content": "БНТУ, Факультет информационных технологий и робототехники (ФИТР). Проходной балл на ПОИТ — 380."},
    {"category": "Льготы", "content": "Медалисты в Беларуси могут поступать без экзаменов на востребованные экономикой специальности."}
]

async def seed():
    # Используем правильное имя фабрики сессий
    async with AsyncSessionLocal() as db:
        for item in KNOWLEDGE_DATA:
            print(f"Обработка: {item['content'][:30]}...")
            
            # 1. Генерируем вектор (эмбеддинг)
            response = ollama.embeddings(model="nomic-embed-text", prompt=item["content"])
            embedding = response["embedding"]

            # 2. Сохраняем в базу
            new_fact = models.KnowledgeBase(
                content=item["content"],
                category=item["category"],
                embedding=embedding
            )
            db.add(new_fact)
        
        await db.commit()
        print("\n✅ База знаний успешно заполнена фактами!")

if __name__ == "__main__":
    asyncio.run(seed())