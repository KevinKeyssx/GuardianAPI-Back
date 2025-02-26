from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class EntityRequire( BaseModel ):
    username    : str       = Field(
        ...,
        example = "Slasher"
    )
    email       : EmailStr  = Field(
        ...,
        example = "john@example.com"
    )


ID_ENTITY = Field(
    ...,
    example = 100000,
    min     = 100000,
    max     = 100000000
)


class EntityId( BaseModel ):
    id: int = ID_ENTITY


class EntityIdLabel( BaseModel ):
    id_lval: int = Field(
        ...,
        example = 1
    )


class EntityBase( EntityRequire ):
    avatar      : str | None        = Field(
        None,
        example = "https://res.cloudinary.com/dbgzsikcs/image/upload/v1696739055/smartnewgen/logo/logo1_fnpwkw.avif"
    )
    names       : str | None        = Field(
        None,
        example = "John"
    )
    lastname    : str | None        = Field(
        None,
        example = "Doe"
    )
    points      : int | None        = Field(
        None,
        example = 100
    )
    phone       : str | None        = Field(
        None,
        example="123-456-7890"
    )
    birthday    : datetime | None   = Field(
        None,
        example = datetime.now()
    )


class EntityIdLabelValue( EntityIdLabel, EntityBase ):
    active      : bool          = Field(
        ...,
        example = True
    )
    created_at  : datetime      = Field(
        ...,
        example = datetime.utcnow()
    )
    comment     : str | None    = Field(
        None,
        example = "This is a comment"
    )


class EntityRegister( EntityIdLabel, EntityRequire ):
    pwd: str = Field(
        ...,
        example = "123456"
    )
    class Config:
        from_attributes = True


class EntitySave( EntityIdLabelValue ):
    class Config:
        from_attributes = True


class Entity( EntityId, EntityIdLabelValue ):
    class Config:
        from_attributes = True


class EntityView( EntityId, EntityBase ):
    role: str = Field(
        ...,
        example     = "Admin",
        min_length  = 4,
        max_length  = 100
    )
    class Config:
        from_attributes = True
    def model_dump(self):
        return {
            "id"        : self.id,
            "role"      : self.role,
            "username"  : self.username,
            "avatar"    : self.avatar,
            "names"     : self.names,
            "lastname"  : self.lastname,
            "points"    : self.points,
            "email"     : self.email,
            "phone"     : self.phone,
            "birthday"  : self.birthday.isoformat() if self.birthday else None,
        }