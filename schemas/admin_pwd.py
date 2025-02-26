# Python
from pydantic   import Field, BaseModel
from datetime   import datetime, date
from pydantic   import Field
from enum       import Enum

# Schemas 
from schemas.schema import ActiveModel, CreateModel, IdModel
from schemas.entity import ID_ENTITY

# Enums
class Times( str, Enum ):
    DAY     = "day"
    WEEK    = "week"
    MONTH   = "month"
    YEAR    = "year"

# Consts
PWD = Field(
    ...,
    min_length  = 20,
    max_length  = 200,
    example     = "ba683346b3ebdf4f3d08a64f61793000020ffe15266b54512fdd12d616e89e78f0edca76a653f6fbaa488e354e70b3d10d2fe0721c51538d85b6f8e24c383112"
)

class AdminDate( BaseModel ):
    change      : bool              = Field(
        ...,
        example = True
    )
    date_change : date      | None  = Field(
        None,
        example = '2023-10-02',
    )
    count       : int               = Field(
        ...,
        example = 5
    )
    time        : Times     | None  = Field(
        None,
        example = Times.DAY
    )

# Class
class AdminPwdBase( ActiveModel, CreateModel, AdminDate ):
    id_entity   : int               = ID_ENTITY
    pwd         : str               = PWD
    created_at  : datetime  | None  = Field(
        None,
        example = datetime.now()
    )


class AdminPwdSave( AdminPwdBase ):
    class Config:
        from_attributes = True

class AdminPwd( IdModel, AdminPwdBase ):
    class Config:
        from_attributes = True