from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# --- HCP Schemas ---
class HCPBase(BaseModel):
    name: str
    specialty: str
    location: str
    last_contact_date: Optional[date] = None

class HCPCreate(HCPBase):
    pass

class HCPResponse(HCPBase):
    id: int
    class Config:
        from_attributes = True

# --- Interaction Log Schemas ---
class InteractionBase(BaseModel):
    hcp_id: int
    date: date
    notes: str
    sentiment: str
    topics: str

class InteractionCreate(InteractionBase):
    pass

class InteractionResponse(InteractionBase):
    id: int
    class Config:
        from_attributes = True

# --- Action Item Schemas ---
class ActionItemBase(BaseModel):
    hcp_id: int
    task_description: str
    due_date: date
    status: str = "Pending"

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemResponse(ActionItemBase):
    id: int
    class Config:
        from_attributes = True