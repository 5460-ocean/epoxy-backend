from pydantic import BaseModel

# -------- CREATE --------
class WizardCreate(BaseModel):
    name: str


# -------- UPDATE --------
class WizardUpdate(BaseModel):
    name: str


# -------- OUTPUT --------
class WizardOut(BaseModel):
    id: int
    name: str
    owner_id: int

    class Config:
        from_attributes = True
