from pydantic import BaseModel, Field


class Idlabel( BaseModel ):
    id_label: int = Field(
        ...,
        example = 1,
        gt      = 0
    )