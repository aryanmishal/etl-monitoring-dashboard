import os
import mysql.connector
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'etl_monitoring')
}

# JWT configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'supersecretkey')  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def get_db_connection():
    """Get a MySQL database connection"""
    return mysql.connector.connect(**MYSQL_CONFIG) 