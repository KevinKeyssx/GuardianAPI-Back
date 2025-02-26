from pydantic import BaseModel, Field


class ResponseModel( BaseModel ):
    message: str = Field(
        ...,
        example = 'Entity saved successfully',
    )
    code: int = Field(
        ...,
        example= 101
    )
    data : None | dict = Field(
        None
    )
    class Config:
        from_attributes = True