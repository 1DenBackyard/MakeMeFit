"""Main FastAPI application."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from aiolimiter import AsyncLimiter
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.routers import auth, requests, payments, trainers, admin, streaming

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to Telegram domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = AsyncLimiter(max_rate=settings.rate_limit_per_minute, time_period=60)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware."""
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/health"):
            return await call_next(request)
        
        async with limiter:
            response = await call_next(request)
            return response


app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(auth.router)
app.include_router(requests.router)
app.include_router(payments.router)
app.include_router(trainers.router)
app.include_router(admin.router)
app.include_router(streaming.router)


@app.get("/health")
async def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "version": settings.app_version}


@app.get("/api/files/{filename}")
async def get_file(filename: str):
    """Serve PDF files."""
    file_path = os.path.join(settings.pdf_storage_path, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/pdf")
    return {"error": "File not found"}, 404
