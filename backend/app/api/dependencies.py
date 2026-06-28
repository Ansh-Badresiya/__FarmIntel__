from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Callable, Any, Tuple
from jwt.exceptions import PyJWTError

from app.db.session import get_db
from app.core.security import verify_token
from app.core.exceptions import CredentialsException, PermissionDenied
from app.models.user import User, UserRole

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Extracts JWT, verifies it, and returns the current user."""
    import uuid
    try:
        payload = verify_token(token)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise CredentialsException(detail="Token payload missing user identifier")
        user_id = uuid.UUID(user_id_str)
    except (PyJWTError, ValueError):
        raise CredentialsException(detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise CredentialsException(detail="User not found")
    if not user.is_active:
        raise CredentialsException(detail="Inactive user")
    return user

def require_role(required_role: UserRole) -> Callable[[User], User]:
    """Dependency factory that checks if current user has the required role."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise PermissionDenied(detail=f"Operation requires {required_role.value} privileges")
        return current_user
    return role_checker


def require_any_role(*allowed_roles: UserRole) -> Callable[[User], User]:
    """
    Dependency factory that grants access if the user has ANY of the given roles.
    Example: require_any_role(UserRole.officer, UserRole.admin)
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            roles_str = " or ".join(r.value for r in allowed_roles)
            raise PermissionDenied(detail=f"Operation requires {roles_str} privileges")
        return current_user
    return role_checker
