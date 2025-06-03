from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from database import Base

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    balance = Column(Float, default=0.0)
    
    # Relationship
    transactions = relationship("Transaction", back_populates="account")
    
    def __repr__(self):
        return f"<Account(id={self.id}, name='{self.name}', balance={self.balance})>" 