import mysql.connector
from config.database import MYSQL_CONFIG

def create_user_settings_table():
    try:
        # Connect to the database
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        
        # Create user_settings table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS user_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            setting_key VARCHAR(100) NOT NULL,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_setting (user_id, setting_key)
        );
        """
        
        cursor.execute(create_table_query)
        conn.commit()
        
        print("✓ user_settings table created successfully!")
        
        # Show table structure
        cursor.execute("DESCRIBE user_settings")
        columns = cursor.fetchall()
        
        print("\nTable structure:")
        for column in columns:
            print(f"  {column[0]} - {column[1]}")
        
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    print("Creating user_settings table...")
    create_user_settings_table()
    print("Done!") 