from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class HCP(Base):
    __tablename__ = "hcps"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    specialty = Column(String(100))
    location = Column(String(200))
    last_contact_date = Column(Date, nullable=True)

    # Relationships
    interactions = relationship("InteractionLog", back_populates="hcp")
    action_items = relationship("ActionItem", back_populates="hcp")

class InteractionLog(Base):
    __tablename__ = "interaction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"))
    date = Column(Date)
    notes = Column(Text)
    sentiment = Column(String(50))
    topics = Column(String(200))

    # Relationship
    hcp = relationship("HCP", back_populates="interactions")

class ActionItem(Base):
    __tablename__ = "action_items"
    
    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"))
    task_description = Column(Text)
    due_date = Column(Date)
    status = Column(String(50), default="Pending")

    # Relationship
    hcp = relationship("HCP", back_populates="action_items")