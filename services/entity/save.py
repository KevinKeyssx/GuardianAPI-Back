# Alchemy
from typing import TYPE_CHECKING

# Dababase
import database as _database

# Models
import models.entity as m_entity

# Schemas
import schemas.entity as s_entity


if TYPE_CHECKING:
    from sqlalchemy.orm import Session


def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Services
async def save_entity(
    insert  : bool, 
    schema  : s_entity.EntitySave,
    db      : "Session"
) -> s_entity.Entity:
    if insert is True:
        schema = m_entity.Entity( **schema.model_dump() )

    db.add( schema )
    db.commit()
    db.refresh( schema )
    return s_entity.Entity.model_validate( schema )