from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    ForeignKey,
    LargeBinary,
    DateTime
)
from sqlalchemy.sql import func
from app.database import Base


class SecureFile(Base):
    __tablename__ = "secure_files"

    # ---------------- PRIMARY KEY ----------------
    id = Column(Integer, primary_key=True, index=True)

    # ---------------- FILE METADATA ----------------
    filename = Column(String(255), nullable=False)

    # ---------------- OWNERSHIP ----------------
    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    department = Column(String(50), nullable=False)

    # ---------------- CLASSIFICATION ----------------
    classification = Column(
        Enum(
            "Public",
            "Internal",
            "Restricted",
            "Confidential",
            "Highly Confidential",
            "Secret",
            "Top Secret",
            name="file_classification_enum"
        ),
        nullable=False
    )

    # ---------------- ENCRYPTION DATA ----------------
    encrypted_key = Column(LargeBinary, nullable=False)
    encrypted_path = Column(String(255), nullable=False)

    # ---------------- FILE INFO ----------------
    size = Column(Integer, nullable=False)

    # ---------------- TIMESTAMPS ----------------
    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
