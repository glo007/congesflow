from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import Role, StatutDemande


# ---------- Auth / Employe ----------
class EmployeCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str = Field(min_length=8)


class EmployeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nom: str
    prenom: str
    email: EmailStr
    role: Role


class LoginIn(BaseModel):
    email: EmailStr
    mot_de_passe: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Soldes ----------
class SoldeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    type_absence_id: int
    annee: int
    jours_acquis: float
    jours_pris: float
    jours_restants: float


class SoldeUpdate(BaseModel):
    type_absence_id: int
    annee: int
    jours_acquis: float


# ---------- Demandes ----------
class DemandeCreate(BaseModel):
    type_absence_id: int
    date_debut: date
    date_fin: date
    motif: str | None = None


class DemandeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    employe_id: int
    type_absence_id: int
    date_debut: date
    date_fin: date
    nb_jours_ouvres: float
    motif: str | None
    statut: StatutDemande
    commentaire_manager: str | None
    created_at: datetime


class DecisionIn(BaseModel):
    commentaire: str | None = None
