from fastapi import FastAPI
from fast_api_backend.main import app
from uvicorn.middleware.wsgi import WSGIMiddleware

application = WSGIMiddleware(app)
