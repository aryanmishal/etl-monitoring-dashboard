#!/usr/bin/env python3
"""
Script to update the existing database schema to add new user fields
"""

import mysql.connector
import sys
import os

# Add the parent directory to the path so we can import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import MYSQL_CONFIG

def update_database_schema():
    """Update the database schema to add new user fields"""
    
    try:
        # Connect to database
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        
        print("Updating database schema...")
        
        # Check if columns already exist
        cursor.execute("SHOW COLUMNS FROM users LIKE 'nickname'")
        nickname_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'full_name'")
        full_name_exists = cursor.fetchone()
        
        # Add nickname column if it doesn't exist
        if not nickname_exists:
            print("Adding nickname column...")
            cursor.execute("ALTER TABLE users ADD COLUMN nickname VARCHAR(50)")
            print("✓ Added nickname column")
        else:
            print("✓ nickname column already exists")
        
        # Add full_name column if it doesn't exist
        if not full_name_exists:
            print("Adding full_name column...")
            cursor.execute("ALTER TABLE users ADD COLUMN full_name VARCHAR(100)")
            print("✓ Added full_name column")
        else:
            print("✓ full_name column already exists")
        
        # Commit the changes
        conn.commit()
        
        # Show the updated table structure
        print("\nUpdated table structure:")
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        for column in columns:
            print(f"  {column[0]} - {column[1]}")
        
        conn.close()
        print("\nDatabase schema updated successfully!")
        
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Updating database schema to include new user fields...")
    update_database_schema()
    print("Done!") 