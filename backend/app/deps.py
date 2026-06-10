"""Dependances d'authentification et de controle d'acces (RBAC)."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employe, Role
from app.security import decoder_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Employe:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decoder_token(token)
    if payload is None or "sub" not in payload:
        raise credentials_exc

    employe = db.get(Employe, int(payload["sub"]))
    if employe is None:
        raise credentials_exc
    return employe


def exiger_roles(*roles: Role):
    """Fabrique une dependance qui n'autorise que certains roles."""

    def verificateur(user: Employe = Depends(get_current_user)) -> Employe:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acces refuse : role insuffisant",
            )
        return user

    return verificateur
