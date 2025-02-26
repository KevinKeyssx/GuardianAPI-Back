# FastApi
from typing             import Any
from fastapi            import status, APIRouter, Header, HTTPException, Depends, Body
from pydantic           import BaseModel, Field
from functions_jwt      import validate_token, generate_jwt

# Sqlalchemy
import sqlalchemy.orm   as _orm

# Services 
import services.auth as s_auth

# Routes
auth_routes     = APIRouter()
tags            = "Auth"

# Services
class Auth( BaseModel ):
    username    : str = Field(
        ...,
        example     = 'Slasher',
        min         = 5,
        max_length  = 100
    )
    pwd         : str = Field(
        ...,
        example = '54264xcsdwer456awsefasdfaefasdkfask',
        min     = 10,
        max     = 255
    )


@auth_routes.post(
    path            = "/login",
    response_model  = str,
    status_code     = status.HTTP_200_OK,
    summary         = 'Login',
    tags            = [ tags ]
)
async def login(
    auth    : Auth          = Body(...),
    db      : _orm.Session  = Depends( s_auth.get_db )
):
    return await generate_jwt(
        username    = auth.username,
        pwd         = auth.pwd,
        db          = db
    )


@auth_routes.post(
    path            = "/verify/token",
    response_model  = Any,
    status_code     = status.HTTP_200_OK,
    summary         = 'Verify if jwt is valid',
    tags            = [ tags ]
)
def verify_token(
    Authorization: str = Header(...)
):
    if Authorization is None:
        raise HTTPException(
            status_code = 400,
            detail      = "Header 'Authorization' is required."
        )
    return validate_token( Authorization, output=True )