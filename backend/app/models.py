import enum
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Role(str, enum.Enum):
    SALARIE = "SALARIE"
    MANAGER = "MANAGER"
    RH = "RH"


class StatutDemande(str, enum.Enum):
    SOUMISE = "SOUMISE"
    VALIDEE = "VALIDEE"
    REFUSEE = "REFUSEE"
    ANNULEE = "ANNULEE"


class Service(Base):
    __tablename__ = "service"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(120), nullable=False)

    employes: Mapped[list["Employe"]] = relationship(back_populates="service")


class TypeAbsence(Base):
    __tablename__ = "type_absence"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    libelle: Mapped[str] = mapped_column(String(120), nullable=False)


class Employe(Base):
    __tablename__ = "employe"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(120), nullable=False)
    prenom: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), unique=True, nullable=False, index=True)
    mot_de_passe_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.SALARIE, nullable=False)
    date_embauche: Mapped[date] = mapped_column(Date, default=date.today)

    service_id: Mapped[int | None] = mapped_column(ForeignKey("service.id"), nullable=True)
    manager_id: Mapped[int | None] = mapped_column(ForeignKey("employe.id"), nullable=True)

    service: Mapped["Service"] = relationship(back_populates="employes")
    manager: Mapped["Employe"] = relationship(remote_side=[id], backref="equipe")

    soldes: Mapped[list["SoldeConge"]] = relationship(
        back_populates="employe", cascade="all, delete-orphan"
    )
    demandes: Mapped[list["DemandeConge"]] = relationship(
        back_populates="employe",
        foreign_keys="DemandeConge.employe_id",
        cascade="all, delete-orphan",
    )


class SoldeConge(Base):
    __tablename__ = "solde_conge"

    id: Mapped[int] = mapped_column(primary_key=True)
    employe_id: Mapped[int] = mapped_column(ForeignKey("employe.id"), nullable=False)
    type_absence_id: Mapped[int] = mapped_column(ForeignKey("type_absence.id"), nullable=False)
    annee: Mapped[int] = mapped_column(Integer, nullable=False)
    jours_acquis: Mapped[float] = mapped_column(default=25.0)
    jours_pris: Mapped[float] = mapped_column(default=0.0)

    employe: Mapped["Employe"] = relationship(back_populates="soldes")
    type_absence: Mapped["TypeAbsence"] = relationship()

    @property
    def jours_restants(self) -> float:
        return self.jours_acquis - self.jours_pris


class DemandeConge(Base):
    __tablename__ = "demande_conge"

    id: Mapped[int] = mapped_column(primary_key=True)
    employe_id: Mapped[int] = mapped_column(ForeignKey("employe.id"), nullable=False)
    type_absence_id: Mapped[int] = mapped_column(ForeignKey("type_absence.id"), nullable=False)
    date_debut: Mapped[date] = mapped_column(Date, nullable=False)
    date_fin: Mapped[date] = mapped_column(Date, nullable=False)
    nb_jours_ouvres: Mapped[float] = mapped_column(nullable=False)
    motif: Mapped[str | None] = mapped_column(Text, nullable=True)
    statut: Mapped[StatutDemande] = mapped_column(
        Enum(StatutDemande), default=StatutDemande.SOUMISE, nullable=False
    )
    commentaire_manager: Mapped[str | None] = mapped_column(Text, nullable=True)
    valideur_id: Mapped[int | None] = mapped_column(ForeignKey("employe.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    employe: Mapped["Employe"] = relationship(
        back_populates="demandes", foreign_keys=[employe_id]
    )
    type_absence: Mapped["TypeAbsence"] = relationship()
    valideur: Mapped["Employe"] = relationship(foreign_keys=[valideur_id])
