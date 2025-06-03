from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime, timedelta

from database import get_db
from models.account import Account
from models.transaction import Transaction

router = APIRouter(prefix="/accounts", tags=["accounts"])

# Pydantic schemas
class AccountCreate(BaseModel):
    name: str
    balance: float = 0.0

class AccountResponse(BaseModel):
    id: int
    name: str
    balance: float
    
    class Config:
        from_attributes = True

class AccountBalanceHistory(BaseModel):
    date: str
    balance: float

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(db: Session = Depends(get_db)):
    """Get all accounts"""
    accounts = db.query(Account).all()
    return accounts

@router.post("/", response_model=AccountResponse)
async def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """Create a new account"""
    db_account = Account(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/balance", response_model=dict)
async def get_accounts_balance(db: Session = Depends(get_db)):
    """Get current balance for all accounts"""
    accounts = db.query(Account).all()
    balance_data = {}
    
    for account in accounts:
        balance_data[account.name] = {
            "id": account.id,
            "current_balance": account.balance,
            "account_name": account.name
        }
    
    return balance_data

@router.get("/{account_id}/balance-history", response_model=List[AccountBalanceHistory])
async def get_account_balance_history(
    account_id: int, 
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get balance history for a specific account"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get transactions for the last N days
    start_date = datetime.now() - timedelta(days=days)
    transactions = db.query(Transaction).filter(
        Transaction.account_id == account_id,
        Transaction.date >= start_date
    ).order_by(Transaction.date).all()
    
    # Calculate balance history
    balance_history = []
    current_balance = account.balance
    
    # Calculate initial balance (balance before the start_date)
    for transaction in reversed(transactions):
        if transaction.transaction_type == "entrada":
            current_balance -= transaction.amount
        else:
            current_balance += transaction.amount
    
    # Build history forward
    balance_history.append({
        "date": start_date.strftime("%Y-%m-%d"),
        "balance": current_balance
    })
    
    for transaction in transactions:
        if transaction.transaction_type == "entrada":
            current_balance += transaction.amount
        else:
            current_balance -= transaction.amount
            
        balance_history.append({
            "date": transaction.date.strftime("%Y-%m-%d"),
            "balance": current_balance
        })
    
    return balance_history

@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int, 
    account_update: AccountCreate, 
    db: Session = Depends(get_db)
):
    """Update an account"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account.name = account_update.name
    account.balance = account_update.balance
    
    db.commit()
    db.refresh(account)
    return account 