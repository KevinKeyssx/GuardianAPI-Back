# SqlAchemy
from sqlalchemy         import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm     import relationship
from database           import Base

# Python
from datetime import datetime

# Model
from models.entity import Entity


class AdminPwds(Base):
    __tablename__ = 'admin_pwds'

    id              = Column( Integer,      primary_key = True, index = True )
    id_entity       = Column( Integer,      ForeignKey('entities.id'), nullable = False )
    pwd             = Column( String(255),  nullable = False )
    change          = Column( Boolean,      nullable = False )
    date_change     = Column( DateTime,     nullable = True )
    count           = Column( Integer,      nullable = False )
    time            = Column( String(100),  nullable = True, default='MONTH' )
    created_at      = Column( DateTime,     nullable = False, default = datetime.utcnow )
    active          = Column( Boolean,      nullable = False, default = True )
    # FK
    entity_pwd      = relationship(Entity,     lazy = 'joined')