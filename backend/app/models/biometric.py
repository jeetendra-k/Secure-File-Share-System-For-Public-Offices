from sqlalchemy import Column, Integer, ForeignKey, LargeBinary, String, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class BiometricData(Base):
    __tablename__ = "biometric_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    face_encoding = Column(LargeBinary, nullable=False)

    algorithm = Column(String(50), default="face_recognition_dlib", nullable=False)

    enrolled_at = Column(TIMESTAMP, server_default=func.now())
