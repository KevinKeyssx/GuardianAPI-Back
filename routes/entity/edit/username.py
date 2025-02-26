# FastApi
from fastapi            import status, Depends, Body
from fastapi.responses  import JSONResponse

# Entity
from routes.entity.entity import EDIT_ENTITY, TAGS, ENDPOINT, entity_save_s, valid_entity, _orm, save_entity, ResponseModel, entity_search_s

# Services
@EDIT_ENTITY.patch(
    path            = f"{ENDPOINT}/username",
    response_model  = ResponseModel,
    status_code     = status.HTTP_200_OK,
    summary         = 'Edit username of entity',
    tags            = [ TAGS ]
)
async def edit_username(
    id          : int           = Body(...),
    username    : str           = Body(...),
    db          : _orm.Session  = Depends( entity_save_s.get_db )
):
    if await entity_search_s.check_exists(
        value   = username,
        db      = db
    ) is not None:
        return JSONResponse(
            status_code = 400,
            content     = {
                "message"   : "El nombre de usuario ya existe.",
                "code"      : 102,
                "status"    : status.HTTP_400_BAD_REQUEST
            }
        )

    entity          = await valid_entity( id, db )
    entity.username = username

    return await save_entity(
        insert  = False,
        schema  = entity,
        db      = db
    )