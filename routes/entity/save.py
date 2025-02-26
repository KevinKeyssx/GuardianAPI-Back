# FastApi
import datetime
from fastapi        import status, APIRouter, HTTPException, Depends, Body
from functions_jwt  import generate_jwt

# Sqlalchemy
import sqlalchemy.orm as _orm

# Services 
import services.entity.save     as entity_save_s
import services.entity.search   as entity_search_s
import services.admin_pwd.save  as admin_pwd_service

# Schemas
import schemas.entity       as s_entity
import schemas.admin_pwd    as s_admin_pwd

# Routes
save_entity = APIRouter()
tags        = "Entity"

# Services
@save_entity.post(
    path            = "/register",
    response_model  = str,
    status_code     = status.HTTP_201_CREATED,
    summary         = 'Create entity',
    tags            = [ tags ]
)
async def register_entity(
    entity_register : s_entity.EntityRegister   = Body(...),
    db              : _orm.Session              = Depends( entity_save_s.get_db )
):
    if await entity_search_s.check_exists(
        value    = entity_register.username,
        db      = db
    ):
        raise HTTPException(
            status_code = 400,
            detail      = "El nombre de usuario o el correo electrónico ya están en uso. Por favor, elija otro."
        )

    entity = s_entity.EntitySave(
        id_lval     = entity_register.id_lval,
        username    = entity_register.username,
        email       = entity_register.email,
        points      = 0,
        active      = True,
        created_at  = datetime.datetime.now(),
        birthday    = None
    )

    entity_save = await entity_save_s.save_entity(
        insert  = True,
        schema  = entity,
        db      = db
    )

    admin_pwd = s_admin_pwd.AdminPwdSave(
        id_entity       = entity_save.id,
        pwd             = entity_register.pwd,
        change          = False,
        date_change     = None,
        count           = 0,
        time            = None,
        created_at      = datetime.datetime.now(),
        active          = True
    )

    admin_pwd_save = await admin_pwd_service.save_admin_pwd(
        insert  = True,
        schema  = admin_pwd,
        db      = db
    )

    return await generate_jwt(
        username    = entity_save.username,
        pwd         = admin_pwd_save.pwd,
        db          = db
    )