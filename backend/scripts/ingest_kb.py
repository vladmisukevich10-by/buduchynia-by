import os
import asyncio
import ollama
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from database import SessionLocal
import models

async def ingest_data():
    kb_path = "./data/kb"
    async with SessionLocal() as db:
        # 1. Опционально: Очищаем старую базу знаний (если хочешь обновить всё)
        # await db.execute(delete(models.KnowledgeBase))
        
        for filename in os.listdir(kb_path):
            if filename.endswith(".txt"):
                with open(os.path.join(kb_path, filename), "r", encoding="utf-8") as f:
                    content = f.read()
                    
                    # Разделяем файл на логические части (например, по пустой строке)
                    # Если файлы маленькие — можно целиком
                    chunks = content.split("\n\n") 
                    
                    for chunk in chunks:
                        if not chunk.strip(): continue
                        
                        # 2. Генерируем эмбеддинг через Ollama
                        print(f"Обработка фрагмента из {filename}...")
                        response = ollama.embeddings(model="nomic-embed-text", prompt=chunk)
                        embedding = response["embedding"]
                        
                        # 3. Сохраняем в базу
                        kb_entry = models.KnowledgeBase(
                            content=chunk,
                            embedding=embedding
                        )
                        db.add(kb_entry)
        
        await db.commit()
        print("✅ Все данные успешно загружены в базу знаний!")

if __name__ == "__main__":
    asyncio.run(ingest_data())