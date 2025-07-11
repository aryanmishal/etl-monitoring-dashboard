import mysql.connector
import bcrypt
from jose import jwt
from fastapi import HTTPException
from datetime import datetime, timedelta, UTC
from config.database import MYSQL_CONFIG, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

def get_db():
    return mysql.connector.connect(**MYSQL_CONFIG)

def create_user(username: str, password: str, nickname: str = None, full_name: str = None):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    cursor.execute("INSERT INTO users (username, nickname, full_name, password_hash) VALUES (%s, %s, %s, %s)", 
                   (username, nickname, full_name, hashed))
    conn.commit()
    conn.close()
    return True

def authenticate_user(username: str, password: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    conn.close()
    if not user or not bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
        return None
    return user

def get_user_by_username(username: str):
    """Get user details by username"""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, nickname, full_name FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) 