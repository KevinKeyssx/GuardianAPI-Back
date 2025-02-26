# FastApi
from fastapi            import APIRouter, HTTPException
from middlewares.verify_token_route import VerifyTokenRoute

# Sqlalchemy
import sqlalchemy.orm as _orm

# Services 
import services.entity.save     as entity_save_s
import services.entity.search   as entity_search_s

# Schemas
import schemas.entity   as entity_m
from schemas.response   import ResponseModel

# Routes
EDIT_ENTITY = APIRouter( route_class=VerifyTokenRoute )
TAGS        = "Entity"
ENDPOINT    = "/entity"


async def valid_entity(
    id: int,
    db: _orm.Session
) -> entity_m.Entity:
    entity = await entity_search_s.check_exists_by_id(
        id = id,
        db = db
    )

    if entity is None:
        raise HTTPException(
            status_code = 404,
            detail      = "El usuario no existe."
        )

    return entity


async def save_entity(
    insert  : bool,
    schema  : entity_m.Entity,
    db      : _orm.Session
) -> ResponseModel:
    await entity_save_s.save_entity(
        insert  = insert,
        schema  = schema,
        db      = db
    )

    return ResponseModel (
        message = 'Entity saved successfully',
        code    = 101,
        status  = 201
    )