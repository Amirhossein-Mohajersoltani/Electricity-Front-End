import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for the application"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'my-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_HOST = os.getenv('FLASK_HOST', '127.0.0.1')
    
    # Database Configuration
    DB_HOST = os.getenv('DB_HOST', '178.236.33.157')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'team_data')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'StrongPassword123!')
    DB_NAME = os.getenv('DB_NAME', 'electrodata')
    
    # CORS Configuration  
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://127.0.0.1:5173')  # Changed to match exact frontend URL
    
    # External API Configuration
    ANALYSIS_API_HOST = os.getenv('ANALYSIS_API_HOST', '178.236.33.157')
    ANALYSIS_API_PORT = int(os.getenv('ANALYSIS_API_PORT', 8000))
    ANALYSIS_API_BASE = f"http://{ANALYSIS_API_HOST}:{ANALYSIS_API_PORT}"
    
    @classmethod
    def get_database_url(cls):
        """Get database connection URL"""
        return f"mysql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}"
    
    @classmethod
    def get_cors_origins(cls):
        """Get CORS origins list"""
        # Support both localhost and 127.0.0.1 for frontend
        origins = [
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5000', 
            'http://localhost:5000'
        ]
        
        # Also add the configured frontend URL if different
        if cls.FRONTEND_URL not in origins:
            origins.append(cls.FRONTEND_URL)
            
        return origins 