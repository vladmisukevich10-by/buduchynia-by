from fastapi import FastAPI

app = FastAPI(
    title="Будучыня.BY API",
    description="Ядро бэкенда для Навигатора талантов",
    version="0.1.0"
)

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "Бэкенд Будучыня.BY успешно запущен!",
        "module": "core"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "db_ready": "pending"}