from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send
import time
from typing import Callable
from collections import defaultdict

rate_limit_cache = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.rate_limit_paths = [
            '/api/review',
            '/api/create_playlist',
            '/api/user',
            '/api/playlists',
            '/api/top_tracks',
            '/api/top_artists',
            '/api/saved_tracks',
            
        ]

    async def dispatch(self, request: Request, call_next: Callable):
        path = request.url.path.lower()

        self.clean_rate_limit_cache()

        should_limit = any(p in path for p in self.rate_limit_paths)
        if not should_limit or request.method != 'POST':
            return await call_next(request)

        if path.startswith('/admin/') or path.startswith('/static/'):
            return await call_next(request)

        ip = self.get_client_ip(request)
        cache_key = f"{ip}_{path}"
        now = time.time()

        recent_requests = [
            timestamp for timestamp in rate_limit_cache[cache_key]
            if now - timestamp < 3600
        ]

        if len(recent_requests) >= 3:
            return JSONResponse(
                status_code=429,
                content={"success": False, "message": "Too many requests. Try again later.", "data" : None}
            )

        recent_requests.append(now)
        rate_limit_cache[cache_key] = recent_requests

        response = await call_next(request)
        return response

    def get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0]
        return request.client.host
    
    def clean_rate_limit_cache(self):
        now = time.time()
        keys_to_delete = []

        for key, timestamps in rate_limit_cache.items():
            updated = [t for t in timestamps if now - t < 3600]

            if updated:
                rate_limit_cache[key] = updated
            else:
                keys_to_delete.append(key)

        for key in keys_to_delete:
            del rate_limit_cache[key]