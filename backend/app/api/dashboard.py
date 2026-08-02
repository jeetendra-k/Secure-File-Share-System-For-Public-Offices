from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.secure_file import SecureFile
from app.models.audit_log import AuditLog
from app.utils.auth import get_current_user
from app.utils.rbac import require_roles

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(require_roles("SUPER_ADMIN", "ADMIN", "AUDITOR"))]
)

@router.get("/metrics")
def get_dashboard_metrics(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_files = db.query(SecureFile).count()

    last_24h = datetime.utcnow() - timedelta(hours=24)
    recent_audits = (
        db.query(AuditLog)
        .filter(AuditLog.created_at >= last_24h)
        .count()
    )

    return {
        "totalFiles": total_files,
        "recentAudits": recent_audits
    }
