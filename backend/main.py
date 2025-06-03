from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables, engine
from models.account import Account
from models.transaction import Transaction
from routers import transactions, accounts
from sqlalchemy.orm import sessionmaker

# Create FastAPI app
app = FastAPI(
    title="Financial Dashboard API",
    description="API para dashboard financeiro pessoal",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions.router)
app.include_router(accounts.router)

@app.on_event("startup")
async def startup_event():
    """Initialize database and create default accounts"""
    create_tables()
    
    # Create default accounts if they don't exist
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if accounts already exist
        existing_accounts = db.query(Account).count()
        
        if existing_accounts == 0:
            # Create 3 default accounts
            default_accounts = [
                Account(name="Conta Corrente", balance=0.0),
                Account(name="Conta Poupança", balance=0.0),
                Account(name="Carteira", balance=0.0)
            ]
            
            for account in default_accounts:
                db.add(account)
            
            db.commit()
            print("✅ Default accounts created successfully!")
        else:
            print(f"✅ Database already has {existing_accounts} accounts")
            
    except Exception as e:
        print(f"❌ Error creating default accounts: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/")
async def root():
    return {
        "message": "Financial Dashboard API", 
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "financial-dashboard-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 