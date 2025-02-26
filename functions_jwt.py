from typing             import Any
from jwt                import encode, decode, exceptions
from datetime           import datetime, timedelta
from os                 import getenv
from fastapi.responses  import JSONResponse

# Sqlalchemy
import sqlalchemy.orm   as _orm

# Services 
import services.auth as s_auth

# Schemas
import schemas.entity as s_entity


def expire_date( days: int ):
    return datetime.now() + timedelta( days )


async def generate_jwt(
    username    : str,
    pwd         : str,
    db          : _orm.Session
) -> str | JSONResponse:
    entity = await s_auth.auth_sesion_view(
        username    = username,
        pwd         = pwd,
        db          = db
    )

    if entity is None:
        return JSONResponse(
            content     = {
                "message"   : "User and/or password are incorrect.",
                "code"      : 101,
                "status"    : 401
            },
            status_code = 401
        )

    new_entity = s_entity.EntityView(
        id          = entity.id,
        username    = entity.username,
        avatar      = entity.avatar,
        names       = entity.names,
        email       = entity.email,
        phone       = entity.phone,
        role        = entity.role,
        lastname    = entity.lastname,
        points      = entity.points,   
        birthday    = entity.birthday
    )

    if entity is not None:
        return write_token( new_entity.model_dump() )
    else:
        return JSONResponse(
            content     = {
                "message"   : "User not found.",
                "code"      : 100,
                "status"    : 404
            },
            status_code = 404
        )


def write_token( data: dict ) -> str:
    return encode(
        payload     = {
            **data,
            "exp": expire_date( 1 )
        },
        key         = getenv("SECRET"),
        algorithm   = "HS256"
    )


def validate_token(
    token   : str,
    output  = False
) -> ( Any | JSONResponse | None ):
    try:
        if output:
            return decode(
                token,
                key         = getenv("SECRET"),
                algorithms  = ["HS256"]
            )
        decode(
            token,
            key         = getenv("SECRET"),
            algorithms  = ["HS256"]
        )
    except exceptions.DecodeError:
        return JSONResponse(
            content = {
                "message": "Invalid Token"
            },
            status_code = 401
        )
    except exceptions.ExpiredSignatureError:
        return JSONResponse(
            content = {
                "message": "Token Expired"
            },
            status_code = 401
        )