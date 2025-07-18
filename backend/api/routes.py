from fastapi import APIRouter, Query, Depends, HTTPException, Header, Body
from services.delta_reader import (
    get_data_sync_status,
    get_user_vitals_status,
    get_summary,
    get_weekly_summary,
    get_monthly_summary
)
from datetime import datetime
from .auth_routes import auth_router
from typing import Dict, Any, Optional
import mysql.connector
from config.database import get_db_connection
from jose import jwt, JWTError
from config.database import SECRET_KEY, ALGORITHM
from services.auth_service import get_user_by_username

router = APIRouter()
router.include_router(auth_router, prefix="/auth")

def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from token"""
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


@router.get("/sync-status")
def sync_status(date: str = Query(default=datetime.today().strftime('%Y-%m-%d')),
                page: int = Query(default=1, ge=1),
                page_size: int = Query(default=10, ge=1)):
    response_data = get_data_sync_status(date)
    all_data = response_data['data']
    columns = response_data['columns']
    total_users = len(all_data)
    total_pages = (total_users + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    paginated_data = all_data[start:end]
    return {
        "date": date,
        "columns": columns,
        "data": paginated_data,
        "total_users": total_users,
        "total_pages": total_pages,
        "page": page,
        "page_size": page_size
    }


@router.get("/user-vitals")
def user_vitals(date: str = Query(default=datetime.today().strftime('%Y-%m-%d')),
                page: int = Query(default=1, ge=1),
                page_size: int = Query(default=10, ge=1)):
    response_data = get_user_vitals_status(date)
    all_data = response_data['data']
    columns = response_data['columns']
    total_users = len(all_data)
    total_pages = (total_users + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    paginated_data = all_data[start:end]
    return {
        "date": date,
        "columns": columns,
        "data": paginated_data,
        "total_users": total_users,
        "total_pages": total_pages,
        "page": page,
        "page_size": page_size
    }


@router.get("/summary")
def summary(date: str = Query(default=datetime.today().strftime('%Y-%m-%d')),
            page: int = Query(default=1, ge=1),
            page_size: int = Query(default=10, ge=1),
            current_user: dict = Depends(get_current_user)):
    summary_data = get_summary(date)
    
    # Get user settings for custom user count
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT setting_key, setting_value 
            FROM user_settings 
            WHERE user_id = %s AND setting_key IN ('user_count_logic', 'custom_user_count')
        """, (current_user['id'],))
        
        settings = {}
        for row in cursor.fetchall():
            settings[row['setting_key']] = row['setting_value']
        
        cursor.close()
        conn.close()
        
        # Apply custom user count if settings indicate custom input
        if (settings.get('user_count_logic') == 'custom_input' and 
            settings.get('custom_user_count') and 
            settings['custom_user_count'].isdigit()):
            custom_count = int(settings['custom_user_count'])
            if custom_count > 0:
                summary_data['total_users'] = custom_count
                print(f"Applied custom user count: {custom_count} for user {current_user['username']}")
        
    except Exception as e:
        print(f"Error applying user settings in summary: {e}")
        # Continue with default behavior if settings can't be applied
    
    # If summary_data contains a list of users, paginate it. Otherwise, return as is with pagination info.
    if isinstance(summary_data, dict) and 'users' in summary_data and isinstance(summary_data['users'], list):
        all_users = summary_data['users']
        total_users = summary_data.get('total_users', len(all_users))
        total_pages = (total_users + page_size - 1) // page_size
        start = (page - 1) * page_size
        end = start + page_size
        paginated_users = all_users[start:end]
        summary_data['users'] = paginated_users
        summary_data['total_users'] = total_users
        summary_data['total_pages'] = total_pages
        summary_data['page'] = page
        summary_data['page_size'] = page_size
    return {"date": date, **summary_data}

@router.get("/summary/weekly")
def weekly_summary(date: str = Query(default=datetime.today().strftime('%Y-%m-%d')),
                   page: int = Query(default=1, ge=1),
                   page_size: int = Query(default=10, ge=1),
                   current_user: dict = Depends(get_current_user)):
    summary_data = get_weekly_summary(date)
    
    # Get user settings for custom user count
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT setting_key, setting_value 
            FROM user_settings 
            WHERE user_id = %s AND setting_key IN ('user_count_logic', 'custom_user_count')
        """, (current_user['id'],))
        
        settings = {}
        for row in cursor.fetchall():
            settings[row['setting_key']] = row['setting_value']
        
        cursor.close()
        conn.close()
        
        # Apply custom user count if settings indicate custom input
        if (settings.get('user_count_logic') == 'custom_input' and 
            settings.get('custom_user_count') and 
            settings['custom_user_count'].isdigit()):
            custom_count = int(settings['custom_user_count'])
            if custom_count > 0:
                summary_data['total_users'] = custom_count
                print(f"Applied custom user count: {custom_count} for user {current_user['username']}")
        
    except Exception as e:
        print(f"Error applying user settings in weekly summary: {e}")
        # Continue with default behavior if settings can't be applied
    
    # If summary_data contains a list of users, paginate it. Otherwise, return as is with pagination info.
    if isinstance(summary_data, dict) and 'users' in summary_data and isinstance(summary_data['users'], list):
        all_users = summary_data['users']
        total_users = summary_data.get('total_users', len(all_users))
        total_pages = (total_users + page_size - 1) // page_size
        start = (page - 1) * page_size
        end = start + page_size
        paginated_users = all_users[start:end]
        summary_data['users'] = paginated_users
        summary_data['total_users'] = total_users
        summary_data['total_pages'] = total_pages
        summary_data['page'] = page
        summary_data['page_size'] = page_size
    return {"date": date, **summary_data}

@router.get("/summary/monthly")
def monthly_summary(date: str = Query(default=datetime.today().strftime('%Y-%m-%d')),
                    page: int = Query(default=1, ge=1),
                    page_size: int = Query(default=10, ge=1),
                    current_user: dict = Depends(get_current_user)):
    summary_data = get_monthly_summary(date)
    
    # Get user settings for custom user count
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT setting_key, setting_value 
            FROM user_settings 
            WHERE user_id = %s AND setting_key IN ('user_count_logic', 'custom_user_count')
        """, (current_user['id'],))
        
        settings = {}
        for row in cursor.fetchall():
            settings[row['setting_key']] = row['setting_value']
        
        cursor.close()
        conn.close()
        
        # Apply custom user count if settings indicate custom input
        if (settings.get('user_count_logic') == 'custom_input' and 
            settings.get('custom_user_count') and 
            settings['custom_user_count'].isdigit()):
            custom_count = int(settings['custom_user_count'])
            if custom_count > 0:
                summary_data['total_users'] = custom_count
                print(f"Applied custom user count: {custom_count} for user {current_user['username']}")
        
    except Exception as e:
        print(f"Error applying user settings in monthly summary: {e}")
        # Continue with default behavior if settings can't be applied
    
    # If summary_data contains a list of users, paginate it. Otherwise, return as is with pagination info.
    if isinstance(summary_data, dict) and 'users' in summary_data and isinstance(summary_data['users'], list):
        all_users = summary_data['users']
        total_users = summary_data.get('total_users', len(all_users))
        total_pages = (total_users + page_size - 1) // page_size
        start = (page - 1) * page_size
        end = start + page_size
        paginated_users = all_users[start:end]
        summary_data['users'] = paginated_users
        summary_data['total_users'] = total_users
        summary_data['total_pages'] = total_pages
        summary_data['page'] = page
        summary_data['page_size'] = page_size
    return {"date": date, **summary_data}

@router.get("/user-settings")
def get_user_settings(current_user: dict = Depends(get_current_user)):
    try:
        print(f"Current user: {current_user}")  # Debug log
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT setting_key, setting_value 
            FROM user_settings 
            WHERE user_id = %s
        """, (current_user['id'],))
        
        settings = {}
        for row in cursor.fetchall():
            settings[row['setting_key']] = row['setting_value']
        
        cursor.close()
        conn.close()
        return settings
        
    except Exception as e:
        print(f"Error in get_user_settings: {e}")  # Add debug logging
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user-settings")
def update_user_settings(settings: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update or insert each setting
        for key, value in settings.items():
            cursor.execute("""
                INSERT INTO user_settings (user_id, setting_key, setting_value) 
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            """, (current_user['id'], key, str(value)))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Settings updated successfully"}
        
    except Exception as e:
        print(f"Error in update_user_settings: {e}")  # Add debug logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-settings")
def test_settings():
    """Temporary test endpoint to check database connection"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT COUNT(*) as count FROM user_settings")
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return {"message": "Database connection successful", "settings_count": result['count']}
        
    except Exception as e:
        print(f"Error in test_settings: {e}")
        return {"error": str(e)}

# --- ADMIN USER MANAGEMENT ENDPOINTS ---
@router.get("/admin/users")
def admin_get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, nickname, full_name, password_hash FROM users")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"users": users}

@router.post("/admin/users")
def admin_add_user(data: dict = Body(...)):
    username = data.get('username')
    password = data.get('password')
    nickname = data.get('nickname')
    full_name = data.get('full_name')
    if not username or not password:
        return {"error": "Username and password are required."}
    import bcrypt
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, nickname, full_name, password_hash) VALUES (%s, %s, %s, %s)",
                       (username, nickname, full_name, hashed))
        conn.commit()
        user_id = cursor.lastrowid
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"error": str(e)}
    cursor.close()
    conn.close()
    return {"success": True, "user_id": user_id}

@router.put("/admin/users/{user_id}")
def admin_update_user(user_id: int, data: dict = Body(...)):
    username = data.get('username')
    password = data.get('password')
    nickname = data.get('nickname')
    full_name = data.get('full_name')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if password:
            import bcrypt
            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            cursor.execute("UPDATE users SET username=%s, nickname=%s, full_name=%s, password_hash=%s WHERE id=%s",
                           (username, nickname, full_name, hashed, user_id))
        else:
            cursor.execute("UPDATE users SET username=%s, nickname=%s, full_name=%s WHERE id=%s",
                           (username, nickname, full_name, user_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"error": str(e)}
    cursor.close()
    conn.close()
    return {"success": True}

@router.delete("/admin/users/{user_id}")
def admin_delete_user(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"error": str(e)}
    cursor.close()
    conn.close()
    return {"success": True}
