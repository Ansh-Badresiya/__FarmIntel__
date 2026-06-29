"""
Script to reset all user passwords to 'password123' in the database.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bcrypt
from app.db.session import SessionLocal
from app.models.user import User

def reset_passwords():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        new_hash = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        print(f"Generated hash (length={len(new_hash)}): {new_hash}")
        
        for user in users:
            user.password_hash = new_hash
            print(f"Resetting password for: {user.email}")
        
        db.commit()
        print("\nAll passwords reset to: password123")
        print("Users updated:")
        for user in users:
            print(f"  - {user.email} ({user.role})")
    finally:
        db.close()

if __name__ == "__main__":
    reset_passwords()
