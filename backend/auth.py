from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .db import get_db
from . import models, schemas

# Configuration
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Increased from 30 to 60 minutes

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"Token created for user {data.get('sub')} with expiration: {expire}")
    return encoded_jwt


def verify_token(token: str, credentials_exception: HTTPException) -> schemas.TokenData:
    print(f"Verifying token: {token[:20]}..." if token else "Token is empty or None")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print(f"Token verification failed: no username in payload")
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
        print(f"Token verified successfully for user: {username}")
    except JWTError as e:
        print(f"Token verification failed with JWTError: {e}")
        print(f"Token length: {len(token) if token else 0}")
        raise credentials_exception
    return token_data


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        print(f"User not found in database: {token_data.username}")
        raise credentials_exception
    print(f"Current user retrieved: {user.username} (admin: {user.is_admin})")
    return user


async def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_admin_user(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
