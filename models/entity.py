# SqlAchemy
from sqlalchemy         import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm     import relationship
from database           import Base

# Python
from datetime import datetime

# Model
from models.label import LabelValues


class Entity( Base ):
    __tablename__ = 'entities'

    id              = Column( Integer,      primary_key = True, index = True )
    id_lval         = Column( Integer,      ForeignKey('label_values.id'), nullable = False )
    username        = Column( String(100),  nullable = False,   unique = True )
    avatar          = Column( String(255),  nullable = True,    unique = True )
    names           = Column( String(100),  nullable = True )
    lastname        = Column( String(100),  nullable = True )
    points          = Column( Integer,      nullable = True )
    email           = Column( String(100),  nullable = False,   unique = True )
    phone           = Column( String(20),   nullable = True,    unique = True )
    birthday        = Column( DateTime,     nullable = True )
    active          = Column( Boolean,      nullable = False,   default = True )
    created_at      = Column( DateTime,     nullable = False,   default = datetime.utcnow )
    comment         = Column( Text )
    # FK
    label_values   = relationship( LabelValues, lazy = 'joined' )


class ViewEntity( Base ):
    __tablename__ = 'view_entity'

    id          = Column( Integer, primary_key = True )
    role        = Column( String( 100 ))
    email       = Column( String( 100 ))
    username    = Column( String( 100 ))
    avatar      = Column( String( 255 ))
    names       = Column( String( 100 ))
    lastname    = Column( String( 100 ))
    points      = Column( Integer )
    phone       = Column( String( 20 ))
    birthday    = Column( DateTime )