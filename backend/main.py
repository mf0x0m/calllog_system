from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from utils.logging_config import setup_logging
from routers.auth import router as auth_router
from routers.training_search import router as training_search_router
from routers.training_detail import router as training_detail_router
from routers.trainee_detail import router as trainee_detail_router
from routers.call_log import router as call_log_router

setup_logging()

app = FastAPI(
    title="CallLog System API",
    description="研修管理システム API",
    version="1.0.0",
    debug=settings.DEBUG
)

app.include_router(auth_router, prefix="/api")
app.include_router(training_search_router, prefix="/api")
app.include_router(training_detail_router, prefix="/api")
app.include_router(trainee_detail_router, prefix="/api")
app.include_router(call_log_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
