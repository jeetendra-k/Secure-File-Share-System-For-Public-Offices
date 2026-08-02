from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base
from datetime import datetime


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)

    action = Column(String(100), nullable=False)
    resource = Column(String(255))
    ip_address = Column(String(45))
    user_agent = Column(Text)

    request_body = Column(Text)

    request_hash = Column(String(64), nullable=False)
    prev_hash = Column(String(64))
    hash = Column(String(64), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
