from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime
import bcrypt

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# In-memory user storage (replace with database later)
users_db = {}

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserSignup):
    """Register a new user"""
    
    # Check if user already exists
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user.password)
    
    user_data = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.now().isoformat()
    }
    
    users_db[user.email] = user_data
    
    # Return user without password
    return UserResponse(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        created_at=user_data["created_at"]
    )

@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return user data"""
    
    # Check if user exists
    if credentials.email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = users_db[credentials.email]
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Return user data (NextAuth will handle session)
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"]
    )

@router.get("/user/{email}", response_model=UserResponse)
async def get_user(email: str):
    """Get user by email"""
    
    if email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_db[email]
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"]
    )