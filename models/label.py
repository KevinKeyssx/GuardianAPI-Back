# SqlAchemy
from sqlalchemy         import Column, Integer, String, ForeignKey, Boolean, Text, DateTime
from sqlalchemy.orm     import relationship
from sqlalchemy_json    import MutableJson

# BD
from database import Base

# Python
from datetime import datetime


class Label(Base):
    __tablename__ = 'labels'

    id              = Column( Integer,       primary_key = True, index = True)
    description     = Column( String(100),   nullable = False,  unique = True )
    active          = Column( Boolean,       nullable = False,  default = True )
    skill           = Column( MutableJson,   nullable = True,   default = '{}')
    created_at      = Column( DateTime,      nullable = False,  default = datetime.utcnow )
    comment         = Column( Text,          nullable = True )


class LabelValues(Base):
    __tablename__ = 'label_values'

    id              = Column( Integer, primary_key = True, index = True )
    id_label        = Column( Integer, ForeignKey( 'labels.id' ))
    description     = Column( String(100),   nullable = False,  unique = True )
    active          = Column( Boolean,       nullable = False,  default = True )
    created_at      = Column( DateTime,      nullable = False,  default = datetime.utcnow )
    skill           = Column( MutableJson,   nullable = True,   default = '{}')
    comment         = Column( Text,          nullable = True )
    # Relacion con Label
    label           = relationship( Label, lazy = 'joined' )