# FastApi
from fastapi import status, Depends, Body
from routes.entity.entity import EDIT_ENTITY, TAGS, ENDPOINT, entity_save_s, valid_entity, _orm, save_entity, ResponseModel

# Services
@EDIT_ENTITY.patch(
    path            = f"{ENDPOINT}/names",
    response_model  = ResponseModel,
    status_code     = status.HTTP_200_OK,
    summary         = 'Edit names of entity',
    tags            = [ TAGS ]
)
async def edit_names(
    id          : int           = Body(...),
    names       : str           = Body(...),
    lastname    : str           = Body(...),
    db          : _orm.Session  = Depends( entity_save_s.get_db )
):
    entity          = await valid_entity( id=id, db=db )
    entity.names    = names
    entity.lastname = lastname

    return await save_entity(
        insert  = False,
        schema  = entity,
        db      = db
    )