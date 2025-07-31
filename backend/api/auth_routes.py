from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from services.auth_service import create_user, authenticate_user, create_access_token, get_user_by_username
from jose import jwt, JWTError
from config.database import SECRET_KEY, ALGORITHM
from typing import Optional
from utils.password_validation import validate_password

auth_router = APIRouter()

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    username: str
    new_password: str

class ProfileUpdate(BaseModel):
    nickname: Optional[str] = None
    full_name: Optional[str] = None

class PasswordUpdate(BaseModel):
    password: str

@auth_router.post("/register")
def register(user: UserRegister):
    # Validate password strength
    is_valid, errors, warnings = validate_password(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Password validation failed: {'; '.join(errors)}")
    
    create_user(user.username, user.password)
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@auth_router.post("/login")
def login(user: UserLogin):
    auth_user = authenticate_user(user.username, user.password)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@auth_router.post("/check-user")
def check_user(data: UserLogin):
    from services.auth_service import get_db
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s", (data.username,))
    user = cursor.fetchone()
    conn.close()
    return {"exists": bool(user)}

@auth_router.post("/reset-password")
def reset_password(data: PasswordResetRequest):
    from services.auth_service import get_db
    import bcrypt
    
    # Validate password strength
    is_valid, errors, warnings = validate_password(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Password validation failed: {'; '.join(errors)}")
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT password_hash FROM users WHERE username=%s", (data.username,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found.")
    # Check if new password is the same as current password
    if bcrypt.checkpw(data.new_password.encode(), user['password_hash'].encode() if isinstance(user['password_hash'], str) else user['password_hash']):
        conn.close()
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password.")
    hashed = bcrypt.hashpw(data.new_password.encode(), bcrypt.gensalt())
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash=%s WHERE username=%s", (hashed, data.username))
    conn.commit()
    conn.close()
    return {"success": True}

def get_current_user(token: str = Depends(HTTPException(status_code=401, detail="Invalid token"))):
    """Get current user from token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = get_user_by_username(username)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@auth_router.get("/profile")
def get_user_profile(authorization: Optional[str] = Header(None)):
    """Get user profile information"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = get_user_by_username(username)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@auth_router.put("/profile")
def update_user_profile(profile_data: ProfileUpdate, authorization: Optional[str] = Header(None)):
    """Update user profile information"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        from services.auth_service import get_db
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        
        # Update only provided fields
        update_fields = []
        update_values = []
        
        if profile_data.nickname is not None:
            update_fields.append("nickname = %s")
            update_values.append(profile_data.nickname)
        
        if profile_data.full_name is not None:
            update_fields.append("full_name = %s")
            update_values.append(profile_data.full_name)
        
        if not update_fields:
            conn.close()
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_values.append(username)
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE username = %s"
        cursor.execute(query, update_values)
        conn.commit()
        
        # Get updated user data
        cursor.execute("SELECT id, username, nickname, full_name FROM users WHERE username = %s", (username,))
        updated_user = cursor.fetchone()
        conn.close()
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return updated_user
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@auth_router.put("/profile/password")
def update_user_password(password_data: PasswordUpdate, authorization: Optional[str] = Header(None)):
    """Update user password"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    # Validate password strength
    is_valid, errors, warnings = validate_password(password_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Password validation failed: {'; '.join(errors)}")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        from services.auth_service import get_db
        import bcrypt
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        
        # Check if new password is the same as current password
        cursor.execute("SELECT password_hash FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        if not user:
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        if bcrypt.checkpw(password_data.password.encode(), user['password_hash'].encode() if isinstance(user['password_hash'], str) else user['password_hash']):
            conn.close()
            raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")
        
        # Hash new password and update
        hashed = bcrypt.hashpw(password_data.password.encode(), bcrypt.gensalt())
        cursor.execute("UPDATE users SET password_hash = %s WHERE username = %s", (hashed, username))
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Password updated successfully"}
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token") 