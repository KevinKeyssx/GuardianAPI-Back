# FastApi
from fastapi import status, APIRouter, Depends, Path

# Sqlalchemy
import sqlalchemy.orm as _orm

# Services 
import services.entity.save     as entity_save_s
import services.entity.search   as entity_search_s

# Routes
search_entity   = APIRouter()
tags            = "Entity"

# Services
@search_entity.get(
    path            = "/check-exists/{value}",
    response_model  = bool,
    status_code     = status.HTTP_200_OK,
    summary         = 'Exists value of user',
    tags            = [ tags ]
)
async def exist_user(
    value   : str           = Path(...),
    db      : _orm.Session  = Depends( entity_save_s.get_db )
):
    if await entity_search_s.check_exists(
        value   = value,
        db      = db
    ) is not None:
        return True
    else:
        return False