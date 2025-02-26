# FastApi
from fastapi            import APIRouter
from fastapi.responses  import  JSONResponse
from middlewares.verify_token_route import VerifyTokenRoute

# Routes
ROUTE = APIRouter( route_class=VerifyTokenRoute )