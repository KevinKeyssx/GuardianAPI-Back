# Alchemy
from typing import TYPE_CHECKING, List

from sqlalchemy import and_

# Dababase
import database as _database

# Models
from models.admin_pwd import AdminPwds

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

# Obtener un usuario por username o email
async def by_pwd_id_entity(
    id  : int,
    pwd : str,
    db  : "Session"
) -> s_admin_pwd.AdminPwd:
    return db.query(
        AdminPwds
    ).filter(
        and_(
            AdminPwds.id_entity == id,
            AdminPwds.pwd       == pwd,
            AdminPwds.active    == True
        )
    ).first()

# Obtenemos los 5 primeros resultados
async def top_five_by_id_entity(
    id  : int,
    db  : "Session"
) -> List[ s_admin_pwd.AdminPwd ]:
    return db.query(
        AdminPwds
    ).filter(
        AdminPwds.id_entity == id,
    ).limit(5).all()

# Obtener un usuario por entityid
async def by_id_entity(
    id  : int,
    db  : "Session"
) -> s_admin_pwd.AdminPwd:
    return db.query(
        AdminPwds
    ).filter(
        and_(
            AdminPwds.id_entity == id,
            AdminPwds.active    == True
        )
    ).first()