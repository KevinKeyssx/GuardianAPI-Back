# Python
from typing import TYPE_CHECKING

# Models
import models.admin_pwd as m_admin_pwd
import models.entity    as m_entity

# Schemas
import schemas.entity as  s_entity

# SqlAchemy
from sqlalchemy import and_, or_

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

# Buscar al usuario desde la vista
async def auth_sesion_view(
    username    : str,
    pwd         : str,
    db          : "Session"
) -> s_entity.EntityView:
    return db.query(
        m_entity.ViewEntity
    ).filter(
        and_(
            or_(
                m_entity.ViewEntity.username    == username,
                m_entity.ViewEntity.email       == username,
            ),
            m_admin_pwd.AdminPwds.pwd      == pwd,
            m_admin_pwd.AdminPwds.active   == True
        )
    ).first()