from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timedelta
import bcrypt
import secrets

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# In-memory user storage (replace with database later)
users_db = {}

# In-memory password reset tokens (replace with database later)
# Format: {token: {"email": str, "expires_at": datetime}}
reset_tokens_db = {}

# In-memory email verification tokens (replace with database later)
# Format: {token: {"email": str, "expires_at": datetime}}
verification_tokens_db = {}

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
    email_verified: Optional[bool] = False

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

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
        "created_at": datetime.now().isoformat(),
        "email_verified": False
    }
    
    users_db[user.email] = user_data
    
    # Generate email verification token
    verification_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=7)  # Token expires in 7 days
    
    verification_tokens_db[verification_token] = {
        "email": user.email,
        "expires_at": expires_at
    }
    
    # TODO: In production, send email with verification link
    # For now, we'll return the token (remove this in production!)
    # In production, send email with link like: /auth/verify-email?token={verification_token}
    
    # Return user without password
    response = UserResponse(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        created_at=user_data["created_at"],
        email_verified=user_data["email_verified"]
    )
    
    # Add token to response for development (remove in production)
    response_dict = response.model_dump()
    response_dict["verification_token"] = verification_token  # Remove in production
    
    return response_dict

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
        created_at=user["created_at"],
        email_verified=user.get("email_verified", False)
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
        created_at=user["created_at"],
        email_verified=user.get("email_verified", False)
    )

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset - generates a reset token"""
    
    # Check if user exists (don't reveal if email exists for security)
    if request.email not in users_db:
        # Return success even if user doesn't exist to prevent email enumeration
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=1)  # Token expires in 1 hour
    
    # Store token
    reset_tokens_db[reset_token] = {
        "email": request.email,
        "expires_at": expires_at
    }
    
    # TODO: In production, send email with reset link
    # For now, we'll return the token (remove this in production!)
    # In production, send email with link like: /auth/reset-password?token={reset_token}
    
    return {
        "message": "If the email exists, a password reset link has been sent",
        "token": reset_token  # Remove this in production - only for development
    }

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    
    # Validate token
    if request.token not in reset_tokens_db:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    token_data = reset_tokens_db[request.token]
    
    # Check if token expired
    if datetime.now() > token_data["expires_at"]:
        del reset_tokens_db[request.token]
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    email = token_data["email"]
    
    # Check if user still exists
    if email not in users_db:
        del reset_tokens_db[request.token]
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate password strength (basic validation)
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    # Update password
    users_db[email]["password"] = hash_password(request.new_password)
    
    # Delete used token
    del reset_tokens_db[request.token]
    
    return {"message": "Password has been reset successfully"}

@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_profile(user_id: str):
    """Get user profile by user ID"""
    
    # Find user by ID
    user = None
    for email, user_data in users_db.items():
        if user_data["id"] == user_id:
            user = user_data
            break
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
        email_verified=user.get("email_verified", False)
    )

@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest):
    """Verify email address using verification token"""
    
    # Validate token
    if request.token not in verification_tokens_db:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    
    token_data = verification_tokens_db[request.token]
    
    # Check if token expired
    if datetime.now() > token_data["expires_at"]:
        del verification_tokens_db[request.token]
        raise HTTPException(status_code=400, detail="Verification token has expired")
    
    email = token_data["email"]
    
    # Check if user still exists
    if email not in users_db:
        del verification_tokens_db[request.token]
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mark email as verified
    users_db[email]["email_verified"] = True
    
    # Delete used token
    del verification_tokens_db[request.token]
    
    return {"message": "Email has been verified successfully"}

@router.post("/resend-verification")
async def resend_verification(request: ResendVerificationRequest):
    """Resend email verification token"""
    
    # Check if user exists (don't reveal if email exists for security)
    if request.email not in users_db:
        # Return success even if user doesn't exist to prevent email enumeration
        return {"message": "If the email exists and is not verified, a verification link has been sent"}
    
    user = users_db[request.email]
    
    # Check if already verified
    if user.get("email_verified", False):
        return {"message": "Email is already verified"}
    
    # Generate new verification token
    verification_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=7)  # Token expires in 7 days
    
    # Remove old tokens for this email (if any)
    tokens_to_remove = [
        token for token, data in verification_tokens_db.items()
        if data["email"] == request.email
    ]
    for token in tokens_to_remove:
        del verification_tokens_db[token]
    
    # Store new token
    verification_tokens_db[verification_token] = {
        "email": request.email,
        "expires_at": expires_at
    }
    
    # TODO: In production, send email with verification link
    # For now, we'll return the token (remove this in production!)
    
    return {
        "message": "If the email exists and is not verified, a verification link has been sent",
        "token": verification_token  # Remove this in production - only for development
    }

@router.put("/profile/{user_id}", response_model=UserResponse)
async def update_profile(user_id: str, request: UpdateProfileRequest):
    """Update user profile"""
    
    # Find user by ID
    user = None
    user_email = None
    for email, user_data in users_db.items():
        if user_data["id"] == user_id:
            user = user_data
            user_email = email
            break
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update name if provided
    if request.name is not None:
        user["name"] = request.name
    
    # Update email if provided
    if request.email is not None and request.email != user_email:
        # Check if new email already exists
        if request.email in users_db:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Remove old email entry and create new one
        del users_db[user_email]
        user["email"] = request.email
        user["email_verified"] = False  # Reset verification when email changes
        users_db[request.email] = user
        
        # Generate new verification token for the new email
        verification_token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(days=7)
        
        # Remove old tokens for old email
        tokens_to_remove = [
            token for token, data in verification_tokens_db.items()
            if data["email"] == user_email
        ]
        for token in tokens_to_remove:
            del verification_tokens_db[token]
        
        # Store new token for new email
        verification_tokens_db[verification_token] = {
            "email": request.email,
            "expires_at": expires_at
        }
    
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
        email_verified=user.get("email_verified", False)
    )