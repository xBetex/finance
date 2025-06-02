from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    description = Column(String, index=True)
    transaction_type = Column(String)  # "entrada" ou "saida"
    category = Column(String)
    amount = Column(Float)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    
    # Relationship
    account = relationship("Account", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, description='{self.description}', amount={self.amount})>" 