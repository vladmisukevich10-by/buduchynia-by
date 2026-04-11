import asyncio
from database import AsyncSessionLocal, engine, Base
import models

async def seed():
    # Используем правильное имя AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        async with db.begin():
            # 1. Очистка старых данных (чтобы не было дублей при тестах)
            # В асинхронном режиме удаление через execute
            from sqlalchemy import delete
            await db.execute(delete(models.Specialty))
            await db.execute(delete(models.Faculty))
            await db.execute(delete(models.University))

            # 2. Создаем БГУИР
            bsuir = models.University(
                name="Белорусский государственный университет информатики и радиоэлектроники",
                short_name="БГУИР",
                description="Ведущий технический вуз Беларуси.",
                history="БГУИР был основан в 1964 году как МРТИ. Сегодня это центр цифровой трансформации образования в стране. Вуз является базовой организацией государств-участников СНГ по образованию в области информатики и радиоэлектроники.",
                cover_image="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070",
                website="bsuir.by",
                address="Минск, ул. П. Бровки, 6",
                founded_year=1964,
                has_military_faculty=True,
                has_dormitory=True
            )
            db.add(bsuir)
            await db.flush() # Получаем ID вуза для связей

            # 3. Создаем факультет ФКСиС
            fksis = models.Faculty(
                name="ФКСиС", 
                description="Факультет компьютерных систем и сетей",
                university_id=bsuir.id
            )
            db.add(fksis)
            await db.flush()

            # 4. Создаем специальность
            spec = models.Specialty(
                name="Программная инженерия",
                code="6-05-0611-01",
                faculty_id=fksis.id,
                budget_score=395,
                paid_score=340,
                subjects=["Математика", "Физика", "Язык"],
                slots_budget=60,
                slots_paid=120
            )
            db.add(spec)
            
            # 5. Для теста добавим еще БГУ
            bsu = models.University(
                name="Белорусский государственный университет",
                short_name="БГУ",
                description="Старейший классический университет страны.",
                history="Основан в 1921 году. Входит в число лучших университетов мира согласно мировым рейтингам.",
                cover_image="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=1974",
                website="bsu.by",
                address="Минск, пр. Независимости, 4",
                founded_year=1921,
                has_military_faculty=True,
                has_dormitory=True
            )
            db.add(bsu)

        await db.commit()
    print("🚀 Данные успешно загружены в PostgreSQL!")

if __name__ == "__main__":
    asyncio.run(seed())