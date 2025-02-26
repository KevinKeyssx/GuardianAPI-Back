# Sqlalchemy
import sqlalchemy       as _sql
import sqlalchemy.orm   as _orm
import sqlalchemy.ext.declarative as _declarative

# Env
from os     import getenv
from dotenv import load_dotenv


load_dotenv( dotenv_path = '.env' )


db_user     = getenv( "db_user" )
db_pass     = getenv( "db_pass" )
db_host     = getenv( "db_host" )
db_port     = getenv( "db_port" )
db_name     = getenv( "db_name" )
db_string   = 'postgresql://{}:{}@{}:{}/{}'.format( db_user, db_pass, db_host, db_port, db_name )
ssl_args    = { 'sslmode':'require' }

engine      = _sql.create_engine( db_string, connect_args=ssl_args, echo=True )
# !Only Dev
# engine = _sql.create_engine( db_string )

# Global
SessionLocal    = _orm.sessionmaker(
    autocommit  = False,
    autoflush   = False,
    bind        = engine
)
Base            = _declarative.declarative_base()