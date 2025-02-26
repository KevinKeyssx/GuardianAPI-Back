# Python
from datetime import timedelta, date

# FastApi
from fastapi import status, Depends, Body

# Admin_pwd
from routes.routes              import ROUTE, JSONResponse
from routes.admin_pwd.admin_pwd import TAGS, ENDPOINT, _orm, ResponseModel, ap_service_search, ap_service_save

# Schemas
from schemas.entity     import EntityId
from schemas.admin_pwd  import AdminPwd, AdminDate, Times

# Class
class AdminDateBody( EntityId, AdminDate ):
    pass

# Methods
def calculate_end_date(
    interval    : int,
    frequency   : Times
) -> date:
    current_date    = date.today()
    frequency       = frequency.lower()

    if frequency == Times.DAY:
        return ( current_date + timedelta( days=interval ))
    elif frequency == Times.WEEK:
        return ( current_date + timedelta( weeks=interval ))
    elif frequency == Times.MONTH:
        year    = current_date.year + ( current_date.month + interval - 1 ) // 12
        month   = ( current_date.month + interval - 1 ) % 12 + 1
        day     = current_date.day
        return date( year, month, day )
    elif frequency == Times.YEAR:
        return ( current_date + timedelta( days=365 * interval ))
    else:
        return current_date

# Services
@ROUTE.patch(
    path            = f"{ENDPOINT}/expiration-date",
    response_model  = ResponseModel,
    status_code     = status.HTTP_200_OK,
    summary         = 'Expiration dates admin',
    tags            = [ TAGS ]
)
async def expiration_date(
    admin   : AdminDateBody = Body(...),
    db      : _orm.Session  = Depends( ap_service_search.get_db )
):
    admin_pwd: AdminPwd = await ap_service_search.by_id_entity(
        id      = admin.id,
        db      = db
    )

    if admin_pwd is None: return JSONResponse(
        content     = ResponseModel(
            message = "Entity not found",
            code    = 250,
        ).model_dump(),
        status_code = status.HTTP_404_NOT_FOUND
    )

    expired = calculate_end_date(
        interval    = admin.count,
        frequency   = admin.time
    )

    admin_pwd.date_change   = expired
    admin_pwd.change        = admin.change
    admin_pwd.count         = admin.count
    admin_pwd.time          = admin.time

    await ap_service_save.save_admin_pwd(
        insert  = False,
        schema  = admin_pwd,
        db      = db
    )

    return ResponseModel(
        message = "Date expired changed successfully",
        code    = status.HTTP_200_OK,
    )