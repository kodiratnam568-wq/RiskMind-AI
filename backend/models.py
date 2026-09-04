from pydantic import BaseModel, Field


class Transaction(BaseModel):

    amount: float = Field(gt=0)

    location: str

    device_id: str

    transactions_last_hour: int = Field(ge=0)

    is_new_device: bool = False

    is_new_location: bool = False
