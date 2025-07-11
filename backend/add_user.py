#!/usr/bin/env python3
"""
Script to manually add a user to the database
"""

import mysql.connector
import bcrypt
import sys
import os

# Add the parent directory to the path so we can import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import MYSQL_CONFIG

def add_user_manually():
    """Add a user manually to the database"""
    
    # User details
    username = "mishal@gmail.com"
    nickname = "Aryan"
    full_name = "Aryan Mishal"
    password = "password123"  # You can change this password
    
    try:
        # Connect to database
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
        if cursor.fetchone():
            print(f"User {username} already exists!")
            conn.close()
            return
        
        # Hash the password
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        
        # Insert the user
        cursor.execute(
            "INSERT INTO users (username, nickname, full_name, password_hash) VALUES (%s, %s, %s, %s)",
            (username, nickname, full_name, hashed)
        )
        
        # Commit the transaction
        conn.commit()
        
        print(f"Successfully added user:")
        print(f"  Username: {username}")
        print(f"  Nickname: {nickname}")
        print(f"  Full Name: {full_name}")
        print(f"  Password: {password}")
        
        # Verify the user was added
        cursor.execute("SELECT id, username, nickname, full_name FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()
        if user:
            print(f"\nUser verified in database with ID: {user[0]}")
        
        conn.close()
        
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Adding user manually to the database...")
    add_user_manually()
    print("Done!") 