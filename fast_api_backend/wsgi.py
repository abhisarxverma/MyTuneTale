from fastapi import FastAPI
from main import app
from uvicorn.middleware.wsgi import WSGIMiddleware

application = WSGIMiddleware(app)
