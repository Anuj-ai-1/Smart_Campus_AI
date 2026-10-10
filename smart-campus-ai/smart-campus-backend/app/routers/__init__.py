from app.routers.auth import router as auth_router
from app.routers.students import router as students_router
from app.routers.analytics import router as analytics_router
from app.routers.database import router as database_router
from app.routers.interventions import router as interventions_router
from app.routers.notices import router as notices_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "students_router",
    "analytics_router",
    "database_router",
    "interventions_router",
    "notices_router",
    "admin_router",
]
