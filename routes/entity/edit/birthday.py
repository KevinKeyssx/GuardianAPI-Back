# FastApi
from datetime import date
from fastapi import status, Depends, Body

# Entity
from routes.entity.entity import EDIT_ENTITY, TAGS, ENDPOINT, entity_save_s, valid_entity, _orm, save_entity, ResponseModel

# Services
@EDIT_ENTITY.patch(
    path            = f"{ENDPOINT}/birthday",
    response_model  = ResponseModel,
    status_code     = status.HTTP_200_OK,
    summary         = 'Edit birthday of entity',
    tags            = [ TAGS ]
)
async def edit_birthday(
    id          : int           = Body(...),
    birthday    : date          = Body(...),
    db          : _orm.Session  = Depends( entity_save_s.get_db )
):
    entity          = await valid_entity( id=id, db=db )
    entity.birthday = birthday

    return await save_entity(
        insert  = False,
        schema  = entity,
        db      = db
    )