from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth_router, students_router, analytics_router, database_router, interventions_router, notices_router, admin_router

# Ensure all tables exist on startup (creates new columns like owner_id, salt)
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="RESTful API Backend for Smart Campus Student Success & Analytics Platform",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = {}
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []))
        details[field] = err.get("msg", "Invalid value")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": {"code": "VALIDATION_ERROR", "message": "Please correct the highlighted fields.", "details": details}},
    )

# Register all routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(students_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(database_router, prefix=settings.API_V1_STR)
app.include_router(interventions_router, prefix=settings.API_V1_STR)
app.include_router(notices_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"status": "healthy", "service": settings.PROJECT_NAME, "docs": "/docs", "api_prefix": settings.API_V1_STR}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
