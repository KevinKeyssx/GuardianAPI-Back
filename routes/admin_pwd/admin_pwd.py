# FastApi
from fastapi            import APIRouter, HTTPException
from middlewares.verify_token_route import VerifyTokenRoute

# Sqlalchemy
import sqlalchemy.orm as _orm

# Services 
import services.admin_pwd.save      as ap_service_save
import services.admin_pwd.search    as ap_service_search

# Schemas
import schemas.admin_pwd    as admin_pwd_schema
from schemas.response       import ResponseModel

# Routes
TAGS        = "Admin Pwd"
ENDPOINT    = "/admin"