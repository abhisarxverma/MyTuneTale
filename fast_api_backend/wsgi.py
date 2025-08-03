from main import app
from asgiref.wsgi import WsgiToAsgi

# Convert FastAPI (ASGI) app to WSGI
application = WsgiToAsgi(app)