# Alchemy
from typing import TYPE_CHECKING

# Dababase
import database as _database

# Models
import models.admin_pwd as m_admin_pwd

# Schemas
import schemas.admin_pwd as s_admin_pwd


if TYPE_CHECKING:
    from sqlalchemy.orm import Session


def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Services
async def save_admin_pwd(
    insert  : bool, 
    schema  : s_admin_pwd.AdminPwdSave,
    db      : "Session"
) -> s_admin_pwd.AdminPwd:
    if insert is True:
        schema = m_admin_pwd.AdminPwds( **schema.model_dump() )

    db.add( schema )
    db.commit()
    db.refresh( schema )
    return s_admin_pwd.AdminPwd.model_validate( schema )