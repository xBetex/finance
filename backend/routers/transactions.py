from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

from database import get_db
from models.transaction import Transaction
from models.account import Account

router = APIRouter(prefix="/transactions", tags=["transactions"])

# Pydantic schemas
class TransactionCreate(BaseModel):
    date: datetime
    description: str
    transaction_type: str
    category: str
    amount: float
    account_id: int

class TransactionUpdate(BaseModel):
    date: Optional[datetime] = None
    description: Optional[str] = None
    transaction_type: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    account_id: Optional[int] = None

class TransactionResponse(BaseModel):
    id: int
    date: datetime
    description: str
    transaction_type: str
    category: str
    amount: float
    account_id: int
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    month: Optional[int] = Query(None, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, description="Filter by year"),
    transaction_type: Optional[str] = Query(None, description="Filter by type (entrada/saida)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    account_id: Optional[int] = Query(None, description="Filter by account"),
    description: Optional[str] = Query(None, description="Filter by description"),
    db: Session = Depends(get_db)
):
    """Get transactions with optional filters"""
    query = db.query(Transaction)
    
    if month:
        query = query.filter(extract('month', Transaction.date) == month)
    if year:
        query = query.filter(extract('year', Transaction.date) == year)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category:
        query = query.filter(Transaction.category == category)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if description:
        query = query.filter(Transaction.description.ilike(f"%{description}%"))
    
    transactions = query.offset(skip).limit(limit).all()
    return transactions

@router.post("/", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Create a new transaction"""
    # Verify account exists
    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    
    # Update account balance
    if transaction.transaction_type == "entrada":
        account.balance += transaction.amount
    else:
        account.balance -= transaction.amount
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db)
):
    """Update a transaction"""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get old values for balance adjustment
    old_account_id = db_transaction.account_id
    old_amount = db_transaction.amount
    old_type = db_transaction.transaction_type
    
    # Update fields
    update_data = transaction_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_transaction, field, value)
    
    # Handle account change and balance updates
    if transaction_update.account_id and transaction_update.account_id != old_account_id:
        # Verify new account exists
        new_account = db.query(Account).filter(Account.id == transaction_update.account_id).first()
        if not new_account:
            raise HTTPException(status_code=404, detail="New account not found")
        
        # Revert old account balance
        old_account = db.query(Account).filter(Account.id == old_account_id).first()
        if old_account:
            if old_type == "entrada":
                old_account.balance -= old_amount
            else:
                old_account.balance += old_amount
        
        # Apply to new account
        new_amount = transaction_update.amount if transaction_update.amount is not None else old_amount
        new_type = transaction_update.transaction_type if transaction_update.transaction_type else old_type
        
        if new_type == "entrada":
            new_account.balance += new_amount
        else:
            new_account.balance -= new_amount
    else:
        # Same account, handle amount or type changes
        account = db.query(Account).filter(Account.id == old_account_id).first()
        if account:
            # Revert old values
            if old_type == "entrada":
                account.balance -= old_amount
            else:
                account.balance += old_amount
            
            # Apply new values
            new_amount = transaction_update.amount if transaction_update.amount is not None else old_amount
            new_type = transaction_update.transaction_type if transaction_update.transaction_type else old_type
            
            if new_type == "entrada":
                account.balance += new_amount
            else:
                account.balance -= new_amount
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction"""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update account balance
    account = db.query(Account).filter(Account.id == db_transaction.account_id).first()
    if account:
        if db_transaction.transaction_type == "entrada":
            account.balance -= db_transaction.amount
        else:
            account.balance += db_transaction.amount
    
    db.delete(db_transaction)
    db.commit()
    return {"detail": "Transaction deleted successfully"}

@router.get("/monthly", response_model=dict)
async def get_monthly_summary(
    year: int = Query(..., description="Year for summary"),
    db: Session = Depends(get_db)
):
    """Get monthly transaction summary"""
    transactions = db.query(Transaction).filter(
        extract('year', Transaction.date) == year
    ).all()
    
    monthly_summary = {}
    for transaction in transactions:
        month = transaction.date.month
        if month not in monthly_summary:
            monthly_summary[month] = {
                "entrada": 0,
                "saida": 0,
                "total": 0,
                "count": 0
            }
        
        if transaction.transaction_type == "entrada":
            monthly_summary[month]["entrada"] += transaction.amount
        else:
            monthly_summary[month]["saida"] += transaction.amount
            
        monthly_summary[month]["count"] += 1
    
    # Calculate totals
    for month_data in monthly_summary.values():
        month_data["total"] = month_data["entrada"] - month_data["saida"]
    
    return monthly_summary 