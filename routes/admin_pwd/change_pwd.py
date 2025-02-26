# FastApi
from fastapi import status, Depends, Body

# Admin_pwd
from routes.routes              import ROUTE, JSONResponse
from routes.admin_pwd.admin_pwd import TAGS, ENDPOINT, _orm, ResponseModel, ap_service_search, ap_service_save
from schemas.admin_pwd          import PWD

# Schemas
from schemas.entity     import EntityId
from schemas.admin_pwd  import AdminPwd

# Class
class AdminPwdBody( EntityId ):
    current_pwd : str = PWD
    new_pwd     : str = PWD

# Services
@ROUTE.post(
    path            = f"{ENDPOINT}/change",
    response_model  = ResponseModel,
    status_code     = status.HTTP_200_OK,
    summary         = 'Change active admin password',
    tags            = [ TAGS ]
)
async def change_pwd(
    admin   : AdminPwdBody  = Body(...),
    db      : _orm.Session  = Depends( ap_service_search.get_db )
):
    # Valida que la entitidad exista.
    admin_pwd: AdminPwd = await ap_service_search.by_pwd_id_entity(
        id      = admin.id,
        pwd     = admin.current_pwd,
        db      = db
    )

    if admin_pwd is None: return JSONResponse(
        content     = ResponseModel(
            message = "Entity not found",
            code    = 250,
        ).model_dump(),
        status_code = status.HTTP_404_NOT_FOUND
    )

    # Validar que la contraseña actual sea diferente a la nueva.
    if admin.current_pwd == admin.new_pwd: return JSONResponse(
        content     = ResponseModel(
            message = "New password is equal to current password.",
            code    = 255,
        ).model_dump(),
        status_code = status.HTTP_400_BAD_REQUEST
    )

    # Obtener las ultimas 5 contraseñas.
    top_five = await ap_service_search.top_five_by_id_entity(
        id      = admin.id,
        db      = db
    )

    # Validar que la contraseña nueva no se encuentre en las ultimas 5 contraseñas.
    if admin.new_pwd in top_five:  return JSONResponse(
        content     = ResponseModel(
            message = "Password already used.",
            code    = 256,
        ).model_dump(),
        status_code = status.HTTP_400_BAD_REQUEST
    )

    old_admin_pwd           = admin_pwd
    old_admin_pwd.active    = False
    admin_pwd.pwd           = admin.new_pwd

    # Guardar la nueva contraseña.
    await ap_service_save.save_admin_pwd(
        insert  = True,
        schema  = admin_pwd,
        db      = db
    )

    # Editamos la contraseña anterior para que no sea activa.
    await ap_service_save.save_admin_pwd(
        insert  = False,
        schema  = old_admin_pwd,
        db      = db
    )

    return ResponseModel(
        data    = {
            "id"    : admin.id,
        },
        message = "Correct password",
        code    = status.HTTP_200_OK,
    )