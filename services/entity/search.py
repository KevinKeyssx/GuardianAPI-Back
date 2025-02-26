# Python
from typing import TYPE_CHECKING

# Models
import models.entity as m_entity

# Schemas
import schemas.entity as s_entity

# SqlAchemy
from sqlalchemy import or_

# Database
import database as _database

# GetBd
def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


if TYPE_CHECKING:
    from sqlalchemy.orm import Session

# Obtener un usuario por username o email
async def check_exists(
    value   : str,
    db      : "Session"
) -> s_entity.Entity:
    return db.query(
        m_entity.Entity
    ).filter(
        or_(
            m_entity.Entity.username    == value,
            m_entity.Entity.email       == value
        )
    ).first()

# Obtener un usuario por id
async def check_exists_by_id(
    id: int,
    db: "Session"
) -> s_entity.Entity:
    return db.query(
        m_entity.Entity
    ).filter(
        m_entity.Entity.id == id,
    ).first()